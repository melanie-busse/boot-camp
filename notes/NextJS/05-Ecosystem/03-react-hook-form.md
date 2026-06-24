# Next.js Ecosystem – react-hook-form

Wenn du ein Formular an `useState` anbindest, löst jeder Tastendruck ein Re-Render aus. Je nach Situation kann das zu massiven Performance-Einbußen führen.

`react-hook-form` verfolgt Eingaben über Refs statt über State, sodass die Komponente nicht neu rendert, während der Nutzer tippt. Re-Renders passieren, wenn die Validierung greift oder das Formular abgeschickt wird. Der Hook liefert eine Funktion namens `register` zum Verbinden von Inputs mit dem Formular, `handleSubmit` zum Umhüllen des Submits mit Validierung, und `formState` zum Auslesen von Fehlern und Submit-Status.

## useForm und das Registrieren von Inputs

`useForm` richtet das Formular ein und liefert die Werkzeuge, die du benötigst, um es mit deinem Markup zu verbinden. Der wichtigste Rückgabewert zum Verbinden von Inputs ist `register`.

```
import { useForm } from "react-hook-form";

type FormValues = {
  name: string;
  quantity: number;
};

function AddItemForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  function onSubmit(data: FormValues) {
    console.log(data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("name")} placeholder="Item name" />
      <input {...register("quantity")} type="number" placeholder="Quantity" />
      <button type="submit">Add item</button>
    </form>
  );
}
```

`FormValues` beschreibt die Form der Daten, die das Formular erzeugt: ein `name`-String und eine `quantity`-Zahl. Es als Typ-Argument an `useForm<FormValues>()` zu übergeben, ist das, was dir Typsicherheit im restlichen Hook gibt. `register` akzeptiert nun nur noch Feldnamen, die auf `FormValues` existieren, und das `data`-Argument in `onSubmit` ist als `FormValues` typisiert statt als `any`.

Das Spreaden von `{...register('name')}` auf ein Input-Element fügt den Feldnamen, einen Ref und interne Event-Handler hinzu. Du schreibst `value` oder `onChange` nicht selbst. `react-hook-form` übernimmt das über den Ref. Der an `register` übergebene String wird zum Schlüssel für den Wert dieses Felds im abgeschickten Datenobjekt.

## Validierungsregeln

Validierungsregeln werden als zweites Argument an `register` übergeben. Sie laufen, wenn das Formular abgeschickt wird, und nach einem ersten fehlgeschlagenen Submit auch, während der Nutzer das Feld ändert.

```
<input
  {...register('name', {
    required: 'Item name is required',
    minLength: { value: 2, message: 'Name must be at least 2 characters' },
  })}
  placeholder="Item name"
/>

<input
  {...register('quantity', {
    required: 'Quantity is required',
    min: { value: 1, message: 'Quantity must be at least 1' },
    valueAsNumber: true,
  })}
  type="number"
  placeholder="Quantity"
/>
```

Die eingebauten Regeln sind:

* `required` — markiert das Feld als Pflichtfeld; der von dir angegebene Wert wird zur Fehlermeldung
* `minLength` / `maxLength` — erzwingen Beschränkungen der Zeichenlänge bei String-Inputs
* `min` / `max` — erzwingen numerische Wertebereichs-Beschränkungen
* `pattern` — prüft den Wert gegen einen regulären Ausdruck
* `valueAsNumber` — wandelt den rohen DOM-String vor der Validierung und dem Submit in eine Zahl um, was bei `type="number"`-Inputs wichtig ist, da das DOM dort immer einen String zurückgibt

## handleSubmit

`handleSubmit` ist ein Wrapper, den du dem `onSubmit` des Formulars übergibst. Er führt zuerst die Validierung aus. Wenn ein Feld seine Regeln nicht erfüllt, wird dein Handler nicht aufgerufen, und die Fehler werden in `formState.errors` geschrieben. Wenn alle Felder bestehen, erhält dein Handler ein einziges Objekt mit allen Feldwerten.

```
function onSubmit(data: FormValues) {
  console.log(data);
  // { name: 'Coffee filters', quantity: 3 }
}

return <form onSubmit={handleSubmit(onSubmit)}>{/* ... */}</form>;
```

Die Schlüssel in `data` entsprechen den Strings, die du jedem `register`-Aufruf übergeben hast. Wenn du ein Feld als `register('name')` registriert hast, befindet sich der abgeschickte Wert unter `data.name`.

## Fehler anzeigen

Validierungsfehler sind unter `formState.errors` verfügbar, einem Objekt, das nach Feldname indiziert ist. Jeder Fehler hat eine `message`-Property mit dem String, den du der fehlgeschlagenen Regel übergeben hast.

```
function AddItemForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  function onSubmit(data: FormValues) {
    console.log(data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register("name", {
          required: "Item name is required",
          minLength: {
            value: 2,
            message: "Name must be at least 2 characters",
          },
        })}
        placeholder="Item name"
      />
      {errors.name && <p>{errors.name.message}</p>}

      <input
        {...register("quantity", {
          required: "Quantity is required",
          min: { value: 1, message: "Quantity must be at least 1" },
          valueAsNumber: true,
        })}
        type="number"
        placeholder="Quantity"
      />
      {errors.quantity && <p>{errors.quantity.message}</p>}

      <button type="submit">Add item</button>
    </form>
  );
}
```

Der Fehler-Absatz wird nur gerendert, wenn `errors.name` existiert. Wenn die Validierung erfolgreich ist, ist der Fehler-Eintrag des Felds `undefined`, und das Element wird nicht angezeigt. Im nächsten Abschnitt wird das `console.log` in `onSubmit` durch einen Aufruf einer Zustand-Store-Action ersetzt, die das abgeschickte Item persistiert.

## Ressourcen

[react-hook-form documentation](https://react-hook-form.com/)

[useForm API reference](https://react-hook-form.com/docs/useform)

[Built-in validation rules](https://react-hook-form.com/get-started)