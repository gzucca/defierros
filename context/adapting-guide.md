# Adapting old components using Cursor AI: A Step-by-Step Guide

This guide outlines a process for adapting old components using Cursor AI. The old components are written in NextJS "Pages" router style, and the new components are written in NextJS "App" router style.

Always use the following imports without changing the path. Read these files to understand the types and models for context:
* Types folder: "@defierros/types"
* Models folder: "@defierros/models"
* DB folder: "@defierros/db"
* Utils folder: "@defierros/utils"
* UI folder: "@defierros/ui"

## 1. Adapt components from Pages router to App router

* 1. Decide if the component should be server or client:
** A. If the component is a page, it should be server and use "export default async function" instead of "export default function".
** B. If the component is a component, it should be client-side (mark with "use client") only if it requires interactivity, such as a form, a modal, or any kind of "onClick" event.
* 2. Always remove all use of "getServerSideProps" and "getStaticProps".
* 3. Always remove all use of dynamic imports.

## 2. Transcribe Javascript code to Typescript

* 1. Always use "export default function" instead of "export const" for components.
* 2. Always destructure the props of the component and functions.
* 3. Generate the types for the props for the component. If there is an object with a name resembling a table in the database, import the type from the types folder (@defierros/types). NEVER import types from the db folder (@defierros/db). Do it like this:
```typescript
import type { Types } from "@defierros/types";

interface Props {
  prop1: string;
  prop2: number;
  car: Types.CarsSelectType;
}
```
* 4. Leave all tailwind classes as they are.
* 5. There are no longer "Sale" or "Auction" objects in the database. Use "Cars" instead.

## 3. Fix imports
If you cannot find a specific import path, leave a comment in the code with the import path and a request for its creation.

## 4. Missing components

This is a work in progress. As such, there are often missing components. If the file is not UI folder or a "_components" folder in the same directory as the component, create a new component. You should do the following:

* 1. Create a "_components" folder in the same directory as the component, if it doesn't exist already.
* 2. Create a new file in the "_components" folder and name it after the component. Use camel case for the file and the function name. Start with capital letter.
* 3. Follow the instructions in the "1. Transcribe Javascript code to Typescript" section.

## 5. Transcribe Redux functions to TRPC api

You have two options for transcribing Redux functions to TRPC api:

* 1. Regarding the "api" object:
** A. In a server component, use the "api" object from "~/trpc/server" to call the TRPC api.
** B. In a client component, use the "api" object from "~/trpc/react" to call the TRPC api.
* 2. If the function required does not already exist, leave a comment in the code with the function signature and a request for its creation.

## 6. Missing functions and features

In the case of missing functions and features, such as socket connections, and utils functions that are being imported withouth much context on what they do, leave a comment in the code with the function signature and a request for its creation.

## 7. Closing up
* 1. Always leave the component in a working state before closing the changes. All features that are not yet implemented should be commented out so that the component is still working.
* 2. Check for eslint errors and warnings.
* 3. Check for typescript errors.
* 4. If you fail to implement changes to fix errors and warnings, leave a comment explaining what needs to be done instead of retrying or removing the code.
