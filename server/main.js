import { Meteor } from 'meteor/meteor'
import { publishComposite } from 'meteor/reywood:publish-composite'

import { Authors, Messages } from '../imports/collections'

const AUTHOR_ID = 'ada'

Meteor.startup(async () => {
  await Messages.removeAsync({})
  await Authors.upsertAsync(AUTHOR_ID, { $set: { name: 'Ada' } })
})

Meteor.publish('messages.plain', function () {
  return Messages.find({}, { sort: { createdAt: 1 } })
})

publishComposite('messages.composite', {
  collectionName: 'compositeMessages',
  find () {
    return Messages.find({}, { sort: { createdAt: 1 } })
  },
  children: [{
    find (message) {
      return Authors.find({ _id: message.authorId })
    }
  }]
})

Meteor.methods({
  // Insert a message, then update it right away: the shape of any document that
  // is created as a placeholder and filled in moments later.
  async 'messages.send' () {
    await Messages.removeAsync({})
    const id = await Messages.insertAsync({
      authorId: AUTHOR_ID,
      text: '…',
      status: 'inserted',
      createdAt: new Date()
    })
    await Messages.updateAsync(id, { $set: { text: 'Hello, world', status: 'updated' } })
  },
  async 'messages.clear' () {
    await Messages.removeAsync({})
  }
})
