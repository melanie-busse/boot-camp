# Next.js Ecosystem – State Management mit Zustand

Eine typische React-Anwendung stößt früher oder später auf ein nerviges Problem, das als „Prop Drilling“ bekannt ist. Das passiert, wenn du dich dabei wiederfindest, Daten durch endlose Schichten von Komponenten nach unten zu reichen, die sie gar nicht benötigen, nur um eine bestimmte Komponente ganz unten im Baum zu erreichen. Next.js ist fantastisch zum Bauen der eigentlichen Oberfläche, lässt dich aber allein, wenn es darum geht, diese Daten saubergeteilt global verfügbar zu machen.

Ein React-Entwickler würde zu `useContext` greifen, das gut funktioniert, um globale Konfigurationen wie Themes oder Spracheinstellungen zu teilen, aber an seine Grenzen stößt, wenn es um dynamischen, sich schnell ändernden Anwendungs-State geht. Da Context bei jeder Wertänderung ein Re-Render in jeder konsumierenden Komponente auslöst, zwingt ein Update einer einzelnen Property auch unbeteiligte Komponenten dazu, erneut auszuführen. Wenn ein einziger Context sowohl Authentifizierungsdaten des Nutzers als auch ein Warenkorb-Array enthält, rendert dein Page-Header jedes Mal neu, wenn ein Artikel zum Warenkorb hinzugefügt wird, obwohl er nur den Benutzernamen liest.

Der traditionelle Workaround besteht darin, den State in mehrere, isolierte Contexts aufzuteilen. Das mildert zwar unnötige Re-Renders, führt aber zu einer Provider-Nesting-Hölle. Deine Root-Komponente wird schnell unter einem Turm von Providern begraben, was die Architektur brüchig und schwer wartbar macht.

Zustand eliminiert die Notwendigkeit für Context-Provider vollständig. Komponenten verbinden sich direkt über einen Hook mit einem Store und fordern über einen Selector eine bestimmte State-Scheibe an. Zustand überwacht diese ausgewählte Scheibe und löst nur dann ein Re-Render aus, wenn sich die angeforderten Daten ändern.

## Einen Store erstellen

Um einen Store zu bauen, definierst du die strukturelle Form deines States und deiner Actions über ein TypeScript-Interface. Übergib dieses Interface an die `create`-Funktion, um strikte Typsicherheit in deiner gesamten Anwendung zu gewährleisten.

```
// store/useCartStore.ts
import { create } from "zustand";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

const useCartStore = create<CartState>((set) => ({
  items: [],

  addItem: (item) =>
    set((state) => ({
      items: [...state.items, item],
    })),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),

  clearCart: () => set({ items: [] }),
}));

export default useCartStore;
```

Das `CartState`-Interface typisiert die Struktur explizit und verhindert dadurch Typ-Konflikte während der Entwicklung. Innerhalb des `create`-Callbacks wird `items` als leeres Array initialisiert. Die `addItem`-Action aktualisiert diesen State, indem sie eine Funktion an `set` übergibt, den aktuellen State erfasst und über den Spread-Operator ein erweitertes Array zurückgibt. Um Immutability zu wahren, verwendet `removeItem` `filter`, um ein neues Array zu erzeugen, statt das bestehende direkt zu verändern. Da `set` Änderungen zusammenführt, statt das oberste Objekt zu ersetzen, bleiben unbeteiligte Store-Properties unangetastet.

Der Store wird einmal erstellt und als Hook exportiert. Jede Komponente kann ihn direkt importieren.

## Zustand-Stores abonnieren

Komponenten abonnieren den Store, indem sie den Hook aufrufen und eine Selector-Funktion übergeben, die die State-Scheibe auswählt, die die Komponente benötigt.

```
// components/CartSummary.tsx
"use client";

import useCartStore from "../store/useCartStore";

export default function CartSummary() {
  const items = useCartStore((state) => state.items);

  return (
    <div className="p-4 border rounded">
      <h2>Your Cart</h2>
      {items.length === 0 ? (
        <p>Cart is empty</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              {item.name} x {item.quantity} - ${item.price * item.quantity}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

Da `CartSummary` gezielt `state.items` auswählt, bleibt es vollständig unberührt, wenn sich andere State-Properties ändern. Sollte der Store später um Nutzereinstellungen oder UI-Toggle-Zustände erweitert werden, rendert diese Komponente nicht neu, wenn sich diese Werte ändern.

## Zustand im Next.js App Router (SSR)

Zustand-Stores funktionieren wie globale Variablen innerhalb des Modul-Scopes. Während dieses Modell in clientseitigen React-SPAs funktioniert, bringt es architektonische Risiken im Next.js App Router während Server-Side Rendering (SSR) mit sich.

Der Node.js-Server verarbeitet Anfragen mehrerer unterschiedlicher Nutzer gleichzeitig. Eine globale Variable auf dem Server bleibt über diese Anfragen hinweg bestehen. Wenn Nutzer A einen Artikel zum Store hinzufügt, wird Nutzer B bei seiner nachfolgenden Anfrage auf denselben Artikel treffen. Diese Schwachstelle wird als Cross-Request State Pollution bezeichnet.

Den Store als rein clientseitig zu behandeln, vermeidet dieses Problem, bringt aber ein anderes Problem mit sich, sobald die Daten persistiert werden. Da ein persistierter Store seinen initialen State aus `localStorage` zieht, kann der Server logischerweise nicht darauf zugreifen. Der Server rendert einen leeren Default, der Client lädt sofort die gespeicherten Daten, und Next.js wirft einen Hydration-Mismatch-Fehler, weil die beiden nicht übereinstimmen. Der einfachste Workaround besteht schlicht darin, das Rendern der Daten zurückzuhalten, bis die Komponente tatsächlich im Browser mountet.

```
// components/CartSummarySafe.tsx
'use client';

import { useState, useEffect } from 'react';
import useCartStore from '../store/useCartStore';

export default function CartSummarySafe() {
  const [hasMounted, setHasMounted] = useState(false);
  const items = useCartStore((state) => state.items);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{item.name} – ${item.price}</li>
      ))}
    </ul>
  );
}
```

Das beseitigt die Warnung, setzt den Fix aber an der falschen Stelle an. Jede Komponente, die aus dem Store liest, benötigt nun ihr eigenes `hasMounted`-Flag und ein frühes `return null`. Am Ende wiederholst du überall denselben Boilerplate. Nachdem wir die Middleware behandelt haben, werden wir dieses Setup verbessern.

## Ressourcen

[Zustand documentation](https://zustand-demo.pmnd.rs/)

[Zustand on GitHub](https://github.com/pmndrs/zustand)

[Zustand comparison with other libraries](https://github.com/pmndrs/zustand#comparison)