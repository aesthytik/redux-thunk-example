---
layout: post
title: Using Redux with React
subtitle: How to fetch data from an API using Redux and React
category: dev
tags: [javascript, react, redux, web]
author: Camil Bradea
author_email: camil.bradea@haufe-lexware.com 
header-img: ""
---

Redux, according to the docs, is "a predictable state container for JavaScript apps." It's a very lightweight (2kB) implementation of flux

One-way data flow. One huge implication of one-way (or unidirectional) data flow is that your data store is not touched by your view. At all. 

React is a UI library. It should only deal with rendering the UI given a particular set of data. If the data changes, 
it should re-render to form a new UI.

When you’re first learning Redux, there are several key concepts to understand: store, actions / action creators, 
and reducer functions. The official documentation is great, and I highly recommend reading through it and playing with the code.

Imagine your app’s state is described as a plain object. This object is like a “model” except that there are no setters. This is so that 
different parts of the code can’t change the state arbitrarily.

The only way to modify state in Redux is to have actions dispatched (passed through) to the store. An action is a plain JavaScript object
that describes what happened. Enforcing that every change is described as an action lets us have a clear understanding of what’s going on 
in the app. If something changed, we know why it changed

Finally, to tie state and actions together, we write a function called a reducer (a name derived from the JavaScript reduce method) 
that takes two parameters: An action, and a next state. The reducer has access to the current (soon to be previous) state, 
applies the given action to that state, and returns the desired next state.
It’s important that reducers are pure and without side effects. Every time you provide the same inputs, you should always get the same output
Reducers do not store state, and they do NOT mutate state. They are passed state, and they return state

While its possible to have a single reducer function manage the entire state transformation for every action, Redux emphasizes using reducer composition. 
This is just a fancy term for breaking down your one large reducer function into lots of smaller reducer functions that handle a particular slice of the 
overall application state.

you can think of the overall combined reducer as the coach, and the smaller reducer functions as the players. Once the action is “shot through” 
the store, the combined reducer “catches” the action and “passes” the same action to each of the smaller reducer functions. Each smaller reducer 
function then examines the action and determines whether it wants to modify that part of the application state that it’s responsible for. And if 
it does, it’ll produce the new state.

``` code ```

At this point, you might have a reasonable question: what happens after each sub reducer function produces it’s next state?
After each sub reducer function produces its corresponding next state, an updated application state object is produced and saved in the store. 
Remember that the store is the single source of truth for the application state, so after each action is run through the reducers, a new state 
is produced and saved in the store.

Redux introduces another concept called Action Creators, which are functions that produce and return actions. These action creators are hooked 
up to React components so that when a user interacts with the UI, the action creators are invoked and create new actions that get dispatched 
to the store.

// more about action creators

``` code ```

great article with a great real-life analogy of how Redux is important and helpful - http://almerosteyn.com/2016/08/redux-explained-again

But that doesn't mean we have to we have to use Redux for everything from now on. There's also a good read about this from Dan Abramov himself - 
https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367

