# Next.js Ecosystem – Form Provider

Ein Formular beginnt als eine einzige Komponente. Wenn es wächst, teilst du es in kleinere Teile auf. In dem Moment, in dem du das tust, taucht ein Problem auf. `register`, `handleSubmit` und `formState` stammen alle aus dem `useForm`-Aufruf im Parent. Eine Kind-Komponente, die einen Input rendert, benötigt `register`, um ihn zu verbinden, und `formState.errors`, um Validierungsmeldungen anzuzeigen, hat aber keinen Zugriff auf beides. Die übliche Antwort ist, sie als Props nach unten zu reichen. Eine Ebene tief ist das noch tolerierbar. Zwei oder drei Ebenen tief, oder über eine Feld-Komponente, die in verschiedenen Formularen wiederverwendet wird, schleppt jeder Input eine Liste von Formular-Props hinter sich her.

`react-hook-form` liefert genau dafür einen Context. `FormProvider` nimmt das Objekt, das `useForm` zurückgibt, und legt es auf einen React-Context. Jede Komponente, die innerhalb des Providers gerendert wird, liest dieselben Formular-Methoden mit `useFormContext`, ohne sie als Props zu erhalten. Der Parent besitzt das Formular weiterhin: Er ruft `useForm` auf, entscheidet über den Submit-Handler und rendert das `<form>`-Element. Die Kinder erhalten `register` nicht mehr über Props, sondern ziehen es stattdessen aus dem Context.

## `FormProvider`

Der Parent behält das gesamte Objekt, das `useForm` zurückgibt, statt es zu destrukturieren, und spreadet dieses Objekt dann auf `FormProvider`.

```
import { FormProvider, useForm } from "react-hook-form";

type FormValues = {
  name: string;
  quantity: number;
};

function AddItemForm() {
  const methods = useForm<FormValues>();

  function onSubmit(data: FormValues) {
    console.log(data);
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <NameField />
        <QuantityField />
        <button type="submit">Add item</button>
      </form>
    </FormProvider>
  );
}

```

* `methods` ist der vollständige Rückgabewert von `useForm`. Es enthält `register`, `handleSubmit`, `formState` und den Rest, statt sie einzeln herauszuziehen.
* `<FormProvider {...methods}>` spreadet dieses Objekt auf den Provider, sodass alles, was `useForm` produziert hat, nun für jeden Nachfahren über den Context lesbar ist.
* `methods.handleSubmit(onSubmit)` verbindet weiterhin Submit und Validierung. Der Parent besitzt den Handler, weil er die Komponente ist, die weiß, was mit den abgeschickten Daten zu tun ist.
* `<NameField />` und `<QuantityField />` nehmen keine Props an. Sie finden, was sie brauchen, über den Context, sodass das Markup des Parents kurz bleibt, selbst wenn die Feld-Komponenten wachsen.

## `useFormContext`

Eine Kind-Komponente ruft `useFormContext` auf, um dieselben Methoden zu lesen, die der Parent eingerichtet hat. Sie gibt das identische Objekt zurück, das `useForm` zurückgegeben hat, sodass `register` und `formState` genau so funktionieren wie damals, als sie im Parent lebten.

```
import { useFormContext } from "react-hook-form";

function NameField() {
  const {
    register,
    formState: { errors },
  } = useFormContext<FormValues>();

  return (
    <>
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
    </>
  );
}

```

`useFormContext<FormValues>()` nimmt dasselbe Typ-Argument wie `useForm<FormValues>()`. Übergib ihm denselben Typ, und `register` akzeptiert nur Feldnamen, die auf `FormValues` existieren, während `errors` gegen diese Felder typisiert ist. Die Feld-Komponente trägt nun ihren eigenen Input, ihre Validierungsregeln und ihre Fehlermeldung an einer Stelle zusammen, was sie wiederverwendbar macht.

`QuantityField` folgt demselben Muster mit ihren eigenen Regeln.

```
function QuantityField() {
  const {
    register,
    formState: { errors },
  } = useFormContext<FormValues>();

  return (
    <>
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
    </>
  );
}

```

## Ressourcen

* [FormProvider and useFormContext](https://react-hook-form.com/docs/useformcontext)
* [FormProvider API reference](https://react-hook-form.com/docs/formprovider)