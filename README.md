## ChatGroup

A chat group implementation for Hyper Hyper Space.

The chat group is modelled as an object, with mutable subobjects for messages, members, permissions, settings, etc. It behaves as a CRDT with reversibility (as defined by HHS' data model).

It has an owner, a set of admins, and a set of members.

The owner can:

* Add an admin
* Remove an admin

The admins can:

* Add a member
* Remove a member
* Change the group configuration
* Delete any message

* Members can:

* Post a message
* Delete one of their own messages


The group has the following configurable settings:

* Contents can be read by anyone, anonymously
* Anybody can join
* Members may add new members


