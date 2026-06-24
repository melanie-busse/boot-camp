# Next.js Ecosystem – Zustand Middlewares

Sobald du eine funktionierende Basisversion eines Zustand-Stores hast, wirst du wahrscheinlich seine Fähigkeiten erweitern wollen. Egal ob du Daten über Seitenneuladungen hinweg persistieren, komplexe State-Mutationen vereinfachen oder mit Debugging-Tools integrieren möchtest – Zustand bietet ein mächtiges Ökosystem an Plugins, die dabei helfen. Diese Plugins werden Middlewares genannt.

Middlewares umhüllen deinen Zustand-Store, um sein Standardverhalten abzufangen und zu erweitern, und fügen Funktionalität hinzu wie das Speichern des States im Browser oder das Verbinden mit Debugging-Tools. Ihre Implementierung erfordert jedoch eine strukturelle Umstellung, wie du den Store mit TypeScript definierst.

## Die TypeScript-Currying-Syntax

TypeScript hat Schwierigkeiten, Typen abzuleiten, wenn Funktionen andere Funktionen mehrfach umhüllen. Beim Aufbau eines reinen Zustand-Stores übergibst du dein Interface direkt an `create`:

```
// Standard syntax (breaks with middlewares)
const useCartStore = create<CartState>((set) => ({ ... }));
```

Das Hinzufügen einer Middleware ändert die Signatur der `set`-Funktion. Verwendest du die Standard-Syntax, kann TypeScript die kombinierten Typen nicht aufzulösen, was zu komplexen Fehlermeldungen führt. Zustand löst das mittels Currying — dem Aufruf einer Funktion, die eine weitere Funktion zurückgibt.

Du rufst `create` mit deinem Interface, aber ohne Argumente auf, was eine neue Store-Creator-Funktion zurückgibt. Diese zweite Funktion rufst du dann mit deinen Middlewares und deiner State-Logik auf.

```
// Currying syntax (required for middlewares)
const useCartStore = create<CartState>()((set) => ({ ... }));
```

Beachte das `()()`. Das erste Klammernpaar legt die Typen fest. Das zweite Klammernpaar erhält die eigentliche Store-Implementierung.

Standardmäßig verschwinden Store-Daten bei einem Seiten-Refresh. Die `persist`-Middleware speichert den State automatisch in `localStorage` (oder `sessionStorage`) und stellt ihn beim Laden der Anwendung wieder her.

Du importierst `persist` und umhüllst deine State-Creator-Funktion damit. Sie benötigt ein Konfigurationsobjekt mit mindestens einer `name`-Property, die zum Schlüssel im `localStorage` wird.

## Persist-Middleware

```
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
  id: string;
  name: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => set((state) => ({ items: [...state.items, item] })),
    }),
    {
      name: "cart-storage", // Key used in localStorage
    },
  ),
);
```

## Immer-Middleware

Zustand erzwingt immutable State-Updates. Wenn du ein Array oder ein tief verschachteltes Objekt aktualisierst, musst du den bestehenden State mit dem Spread-Operator (`...state`) kopieren, statt ihn direkt zu verändern. Das verhindert zwar unerwartete Seiteneffekte, aber das Schreiben tief verschachtelter Spread-Operatoren wird schnell mühsam und schwer lesbar.

`immer` ist eine Library, mit der du Code schreiben kannst, der so aussieht, als würde er den State direkt mutieren, während im Hintergrund sicher eine immutable Kopie erzeugt wird. Da `immer` eine eigenständige Library ist, müssen wir sie installieren.

```
npm install immer
# or: bun add immer
```

Zustand bietet eine erstklassige Middleware für `immer`:

```
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

// ... CartState interface ...

export const useCartStore = create<CartState>()(
  immer((set) => ({
    items: [],
    addItem: (item) =>
      set((state) => {
        state.items.push(item);
      }),
  })),
);
```

Beachte, wie wir in der `addItem`-Funktion oben einfach `.push()` auf dem Array verwenden. Wir müssen kein neu konstruiertes Objekt mehr zurückgeben oder Spread-Operatoren verwenden. Wenn du `immer` verwendest, muss deine `set`-Funktion kein Objekt mehr zurückgeben. Du veränderst einfach den im Callback bereitgestellten Draft-State.

## Middlewares kombinieren

Du kannst mehrere Middlewares verschachteln, um sie beide auf deinen Store anzuwenden:

```
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

// ... CartState interface ...

export const useCartStore = create<CartState>()(
  immer(
    persist(
      (set) => ({
        items: [],
        addItem: (item) =>
          set((state) => {
            state.items.push(item);
          }),
      }),
      { name: "cart-storage" },
    ),
  ),
);
```

## Behebung des Hydration Mismatch

Wie bereits besprochen, durchlaufen Client Components eine SSR-Render-Phase, bevor sie im Frontend hydratisiert werden. Wenn die beiden Render-Stufen unterschiedliche Ergebnisse liefern, führt das zu einem Hydration-Fehler. Das passiert regelmäßig, wenn wir unseren Store mit `localStorage` persistieren. Der Server erhält den Default-State, der Client hat Zugriff auf die persistierten Daten, und die Ergebnisse stimmen nicht überein.

Um dieses Problem zu umgehen, können wir folgenden Trick nutzen: Wir überspringen die Hydration in unserer Persist-Schicht, sodass diese die Default-Werte zurückgibt, genau wie auf dem Server. Anschließend rehydrieren wir den Store manuell einmalig in einem `useEffect`, das in einem dünnen Wrapper um unseren Store platziert wird.

```
import { useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// ... CartState interface ...

const cartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          state.items.push(item);
        }),
    }),
    {
      name: "store",
      skipHydration: true,
    },
  ),
);

let rehydrated = false;

export function useCartStore<T>(selector: (state: CartState) => T): T {
  useEffect(() => {
    if (!rehydrated) {
      rehydrated = true;
      cartStore.persist.rehydrate();
    }
  }, []);

  return cartStore(selector);
}
```

Der exportierte `useCartStore`-Hook ist das, was wir tatsächlich in den Komponenten verwenden. Er erhält die Selector-Funktion und gibt sie an den Store weiter. Außerdem ruft er das `useEffect` auf, das die Rehydration auslöst. Da das `rehydrated`-Flag von jedem `useCartStore`-Aufruf geteilt wird, läuft die Rehydration nur einmal.

## Ressourcen

[Zustand Middlewares Guide](https://zustand.docs.pmnd.rs/integrations/persisting-store-data)

[Persist Reference](https://zustand.docs.pmnd.rs/middlewares/persist)

[Immer Reference](https://zustand.docs.pmnd.rs/integrations/immer-middleware)