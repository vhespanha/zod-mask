# zod-mask

Semantically mask fields out of [Zod](https://zod.dev/) schemas.

## Description

zod-mask is a utility library that lets you define multiple named views of a
single Zod schema - each exposing only the fields relevant to a given stage of
your validation lifecycle. Instead of maintaining separate schemas for your
create, read, and update operations, you annotate once and derive as many views
as you need.

## Getting Started

### Installation

Install using your favorite JavaScript package manager:

```bash
npm install zod-mask
```

zod-mask extends Zod's API in a familiar way, so your project will also need
Zod installed as a peer dependency:

```bash
npm install zod
```

### Usage

Import both Zod and zod-mask:

```typescript
import * as z from 'zod';
import * as zm from 'zod-mask';
```

Define your schema as usual, then annotate each field with the views it belongs
to using `.mask()`:

```typescript
const UserSchema = z.object({
	id: z.uuid().mask('read'),
	name: z.string().mask('read', 'create', 'update'),
	friends: z.array(z.uuid()).mask('read', 'update'),
});
```

Derive a view by calling the corresponding method on your schema:

```typescript
const UpdateUser = UserSchema.update();
```

This produces a schema containing only the fields tagged with `'update'`:

```typescript
// Equivalent to:
const UpdateUser = z.object({
	name: z.string(),
	friends: z.array(z.uuid()),
});
```

Fields without a matching mask label are simply omitted - no extra config, no
duplication.
