import { Mongo } from 'meteor/mongo'

export const Messages = new Mongo.Collection('messages')
export const Authors = new Mongo.Collection('authors')
// The publishComposite side is published under this name so both
// subscriptions can share one connection without the merge box combining them.
export const CompositeMessages = new Mongo.Collection('compositeMessages')
