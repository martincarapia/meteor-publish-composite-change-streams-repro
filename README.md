# publish-composite on Meteor 3.5+: updates dropped under change streams

A minimal Meteor 3.6 app that reproduces
[Meteor-Community-Packages/meteor-publish-composite#195](https://github.com/Meteor-Community-Packages/meteor-publish-composite/issues/195)
and shows the fix proposed in
[#194](https://github.com/Meteor-Community-Packages/meteor-publish-composite/pull/194).

## What it shows

One collection and two subscriptions to the same cursor:

| Column | Publication |
| --- | --- |
| Left | `Meteor.publish('messages.plain')` |
| Right | `publishComposite('messages.composite')` with one child, the message's author |

**Insert, then update** inserts a message (`…`, `inserted`) and updates it right away (`Hello, world`, `updated`).

On Meteor 3.6 with its default reactivity driver (change streams, the default since Meteor 3.5), `reywood:publish-composite` 1.9.0 drops the update. The right column keeps the inserted version until you resubscribe or reload, while the left column shows the update. With the fix, both columns show the update.

The `publishComposite` side is published under a different client collection name (`collectionName: 'compositeMessages'`), so the two subscriptions don't merge on the client.

## Run it

Requires [Meteor](https://docs.meteor.com/about/install) 3.6.

```sh
git clone https://github.com/martincarapia/meteor-publish-composite-change-streams-repro.git
cd meteor-publish-composite-change-streams-repro
meteor npm install
```

**Published 1.9.0** (shows the bug), at http://localhost:3000:

```sh
meteor npm start
```

**With the fix from #194**, at http://localhost:3100:

```sh
meteor npm run start:fix
```

`start:fix` clones the PR branch into `.fix/publish-composite` and loads it through `METEOR_PACKAGE_DIRS`, so it overrides the published package. It uses its own `METEOR_LOCAL_DIR` and port, so both versions can run at the same time.

## What to expect

Click **Insert, then update** in each:

| Version | Left (`Meteor.publish`) | Right (`publishComposite`) |
| --- | --- | --- |
| 1.9.0 | `Hello, world` · `updated` | `…` · `inserted` |
| With #194 | `Hello, world` · `updated` | `Hello, world` · `updated` |

## Why it happens

The `added` observer callback publishes a document's children before sending the document, and the observer doesn't wait for it. Change streams report the insert and the update as separate events, so the `changed` arrives while `added` is still publishing the children. At that point the subscription hasn't seen the document yet, so the change is dropped. The polling and oplog drivers tend to merge the two writes, which is why the same app works with them. To try that, run:

```sh
METEOR_REACTIVITY_ORDER=polling meteor npm start
```

(The label at the top of the page still says "change streams" in that case.)

See [#195](https://github.com/Meteor-Community-Packages/meteor-publish-composite/issues/195) for the full analysis.
