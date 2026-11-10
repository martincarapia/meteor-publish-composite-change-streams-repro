import { Meteor } from 'meteor/meteor'
import { Tracker } from 'meteor/tracker'

import { CompositeMessages, Messages } from '../imports/collections'
import './main.css'

function renderList (container, docs) {
  container.replaceChildren(...docs.map((doc) => {
    const card = document.createElement('div')
    card.className = `demo-card demo-card-${doc.status}`
    const text = document.createElement('p')
    text.className = 'demo-card-text'
    text.textContent = doc.text
    const status = document.createElement('span')
    status.className = 'demo-card-status'
    status.textContent = doc.status
    card.append(text, status)
    return card
  }))
  if (!docs.length) {
    const empty = document.createElement('p')
    empty.className = 'demo-empty'
    empty.textContent = 'No messages'
    container.append(empty)
  }
}

Meteor.startup(() => {
  document.getElementById('demo-version').textContent =
    Meteor.settings.public?.label ?? ''

  Meteor.subscribe('messages.plain')
  Meteor.subscribe('messages.composite')

  Tracker.autorun(() => {
    renderList(document.getElementById('plain-list'), Messages.find({}, { sort: { createdAt: 1 } }).fetch())
  })
  Tracker.autorun(() => {
    renderList(document.getElementById('composite-list'), CompositeMessages.find({}, { sort: { createdAt: 1 } }).fetch())
  })

  document.getElementById('send').addEventListener('click', () => Meteor.callAsync('messages.send'))
  document.getElementById('clear').addEventListener('click', () => Meteor.callAsync('messages.clear'))
})
