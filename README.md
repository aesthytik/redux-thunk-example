---
layout: post
title: Redux with React
subtitle: Intro into Redux and how to fetch data from an API using Redux and React
category: dev
tags: [javascript, react, redux, web]
author: Camil Bradea
author_email: camil.bradea@haufe-lexware.com 
header-img: ""
---

### Introduction

Redux, according to the [offical docs](http://redux.js.org), is a predictable state container for JavaScript apps. It's a very lightweight implementation of Flux, which is another library for managing the state. Basically Redux took the ideas that Flux brought in, leaving out its complexity by "borrowing" things from [Elm](http://elm-lang.org/).



For starters, there are several key concepts to understand: store, actions and action creators, and reducer functions. The official documentation is very straightforward and also plenty of examples and nice analogies can be found on the internet.

### Principles

Redux has three fundamental principles:
- single source of truth

The whole state of the application is stored in an object tree (within a single store). We can say that your state is described as a plain object. Think of it as a “model”, but that there are no setters. Because of this, different parts of the code cannot change the state.
Also, a single state tree enables us to debug our application with ease.

- state is read-only

In order to modify state in Redux actions have to be dispatched (passed through) to the store. An action is a plain JavaScript object that describes what happened, sending data from the application to the store. Every change is described only as an action in the app, so if something changed, we know why it did.

An action will look like this:
```
    {
        type: 'ACTION_TYPE',
        action_value: string
    }
```

- changes are made with pure functions

In order to tie state and actions together, we write a function called a reducer that takes two parameters: an action, and a next state. This pure function has access to the current (soon to be previous) state, applies the passed-as-a-parameter action to that state, and finally it returns the desired next state.

Example of a reducers:
```
    export function itemsAreLoading(state = false, action) {
        switch (action.type) {
            case 'ACTION_TYPE':
                return action.action_value;
            default:
                return state;
        }
    }   
```

**Important:** Reducers do not store state, and they do not mutate state. You pass state to the reducer and the reducer will return state.

### How it works

As a best practice, its possible to have a single reducer function which manages the transformation done by every action, it is better to use reducer composition - breaking down the reducer into multiple, smaller reducers, each of them handling a specific slice of the application state.

When one action is dispatched the store, the combined reducer catches the action and sends it to each of the smaller reducers. Each smaller reducer examines what action was passed and dictates if and how to modify that part of state that it is responsible for, producing a new state. You will find an example of a combined reducer a bit later in the article.

After each smaller reducer produces its corresponding next state, an updated state object will be saved in the store. 
Because this is important, I'm mentioning again that the store is the single source of truth in our application. Therefore, when each action is run through the reducers, a new state is produced and saved in the store.

Besides all of this, Redux comes up with another concept - action creators - which are functions that return actions. These are hooked up to React components and when interacting with your application, the action creators are invoked (for example in one 
of the lifecycle methods) and create new actions that get dispatched to the store.

```
    export function itemsAreLoading(bool) {
        return {
            type: 'ACTION_TYPE',
            action_value: bool
        };
    }
```

### Fetching data from an API

Now onto our application. All of the above code examples were just dummy examples. Now we will dive into the code of our 
application and I will put here (almost) all the code of the app. Also a github repo will be available at the end of the article.

Our app will fetch (asynchronously) data that is retrieved by an API (we will assume the API is already built, deployed and
working properly) and then display the fetched data.

**Designing our state**

In order for this application to work properly, our state needs to have 3 properties: `isLoading`, `hasError` and `items`.
Normally you'll think that this means we'll also have 3 action creators, so 3 action creators, but no :). We need a 4th
action creator which will call the other 3 action creators based on the status or our request to the API.

**Action creators**

Let's have a look at the first 3 action creators:

```
    export function itemsHaveError(bool) {
        return {
            type: 'ITEMS_HAVE_ERROR',
            hasErrored: bool
        };
    }

    export function itemsAreLoading(bool) {
        return {
            type: 'ITEMS_ARE_LOADING',
            isLoading: bool
        };
    }

    export function itemsFetchDataSuccess(items) {
        return {
            type: 'ITEMS_FETCH_DATA_SUCCESS',
            items
        };
    }
```

Firstly, we use the `export` keyword so that we can use our action creators anywhere in our codebase.

The first 2 action creators will receive a bool as an argument and they will return an object with that bool value and
the corresponding type.

The last one will be called after the fetching was successful and will receive the fetched items as an argument. This
action creator will return an object with a property called `items` which will receive as value the array of items which
were passed as an argument. As a syntactic sugar of ES6, we can write just `items` instead if `items: items`.



From the box, action creators don't know how to make asynchronous actions. That's where [Redux Thunk](https://github.com/gaearon/redux-thunk) comes in handy. In order to use Redux Thunk, we have to add it to our store 
(the code of our store can be found later in this article).



Thunk allows us to have action creators that return a function instead of an action. Knowing these, our action creator will
look like this:

```
    export function itemsFetchData(url) {
        return (dispatch) => {
            dispatch(itemsAreLoading(true));

            fetch(url)
                .then((response) => {
                    if (!response.ok) {
                        throw Error(response.statusText);
                    }

                    dispatch(itemsAreLoading(false));

                    return response;
                })
                .then((response) => response.json())
                .then((items) => dispatch(itemsFetchDataSuccess(items)))
                .catch(() => dispatch(itemsHaveError(true)));
        };
    }
```

**Reducers**

Now that we have our action creators in place, let's start writing our reducers, that take the actions and return a new
state.

**Note:** All reducers will be called when an action is dispatched. Because of this we are returning the original state
in each of our reducers. When an action is dispatched, not all the reducers will create new state. The one's that will
not create a new state need to return the original state. So we use a `switch` statement to determine when the action type
matches.

Each reducer takes 2 parameters: the (soon to be previous) state (what is after the `=` sign is a default value in case 
state is undefined) and an action object:

```
    export function itemsHaveError(state = false, action) {
        switch (action.type) {
            case 'ITEMS_HAVE_ERROR':
                return action.hasError;
            default:
                return state;
        }
    }

    export function itemsAreLoading(state = false, action) {
        switch (action.type) {
            case 'ITEMS_ARE_LOADING':
                return action.isLoading;
            default:
                return state;
        }
    }

    export function items(state = [], action) {
        switch (action.type) {
            case 'ITEMS_FETCH_DATA_SUCCESS':
                return action.items;
            default:
                return state;
        }
    }
```

Now that we have the reducers created, let's combine them:

```
    import { combineReducers } from 'redux';
    import { items, itemsHasErrored, itemsIsLoading } from './items';

    export default combineReducers({
        items,
        itemsHaveError,
        itemsAreLoading
    });
```

**Creating the store**

Don't forget about including the Redux Thunk middleware.

```
    import { createStore, applyMiddleware } from 'redux';
    import thunk from 'redux-thunk';
    import rootReducer from '../reducers';

    export default function configureStore(initialState) {
        return createStore(
            rootReducer,
            initialState,
            applyMiddleware(thunk)
        );
    }
```

**Using the store in our index.js**

```
    import React from 'react';
    import { render } from 'react-dom';
    import { Provider } from 'react-redux';
    import configureStore from './store/configureStore';

    import ItemList from './components/ItemList';

    const store = configureStore(); // You can also pass in an initialState here

    render(
        <Provider store={store}>
            <ItemList />
        </Provider>,
        document.getElementById('app')
    );
```

**Writing our React component which shows our fetched data**

Let's start by talking about what we are importing here.

In order to work with Redux, we have to import `connect` from redux:


```
    import { connect } from 'react-redux';
```

Also, because we will fetch the data in this component, we will import our action creator that fetches data:

```
    import { itemsFetchData } from '../actions/items';
```

We are imporing only this action creator, because this one one also dispatches the other actions to our reducers.

Next step would be to map the state to the components' props. For this, we will write a function that receives `state`
and returns the props object.

```
    const mapStateToProps = (state) => {
        return {
            items: state.items,
            hasError: state.itemsHaveError,
            isLoading: state.itemsAreLoading
        };
    };
```

Also, we need to dispatch our imported action creator.

```
    const mapDispatchToProps = (dispatch) => {
        return {
            fetchData: (url) => dispatch(itemsFetchData(url))
        };
    };
```

Now in order to make these methods do something, when we export our component, we have to pass these methods as
parameters to `connect`. This connects our component to Redux.

```
    export default connect(mapStateToProps, mapDispatchToProps)(ItemList);
```

Finally, we will call this action creator in the `componentDidMount` lifecycle method:

```
    this.props.fetchData('http://5826ed963900d612000138bd.mockapi.io/items');
```

Side note: if you are wondering why are we calling the action creator on componentDidMount instead of other 
lifecycle methods, I have found a couple of good reasons [here](https://tylermcginnis.com/react-interview-questions/):
> You can’t guarantee the AJAX request won’t resolve before the component mounts. If it did, that would mean that you’d be trying to setState on an unmounted component, which not only won’t work, but React will yell at you for. Doing AJAX in componentDidMount will guarantee that there’s a component to update.

> Fiber, the next implementation of React’s reconciliation algorithm, will have the ability to start and stop rendering as needed for performance benefits. One of the trade-offs of this is that componentWillMount, the other lifecycle event where it might make sense to make an AJAX request, will be “non-deterministic”. What this means is that React may start calling componentWillMount at various times whenever it feels like it needs to. This would obviously be a bad formula for AJAX requests.

Besides this, we need some validations and the actual iteration over our fetched data array. At the end, our component will look
like this:

```
    import React, { Component, PropTypes } from 'react';
    import { connect } from 'react-redux';
    import { itemsFetchData } from '../actions/items';

    class ItemList extends Component {
        componentDidMount() {
            this.props.fetchData('http://5826ed963900d612000138bd.mockapi.io/items');
        }

        render() {
            if (this.props.hasError) {
                return <p>Sorry! There was an error loading the items</p>;
            }

            if (this.props.isLoading) {
                return <p>Loading…</p>;
            }

            return (
                <ul>
                    {this.props.items.map((item) => (
                        <li key={item.id}>
                            {item.label}
                        </li>
                    ))}
                </ul>
            );
        }
    }

    ItemList.propTypes = {
        fetchData: PropTypes.func.isRequired,
        items: PropTypes.array.isRequired,
        hasError: PropTypes.bool.isRequired,
        isLoading: PropTypes.bool.isRequired
    };

    const mapStateToProps = (state) => {
        return {
            items: state.items,
            hasError: state.itemsHaveError,
            isLoading: state.itemsAreLoading
        };
    };

    const mapDispatchToProps = (dispatch) => {
        return {
            fetchData: (url) => dispatch(itemsFetchData(url))
        };
    };

    export default connect(mapStateToProps, mapDispatchToProps)(ItemList);
```

And that was about all !

### Last words and other resources

We now have an app that is fetching data asynchronously from an API, using React for our UI and Redux for managing
the state of our application.



If you not familiar with Javascript or even React, probably this was pretty weird for you (as it was and honestly 
sometimes I still find React to be weird)

- [Github repo](https://github.com/bradeac/using-redux-with-react)
- [Redux docs](http://redux.js.org/)
- [Redux video tutorial by Dan Abramov](https://egghead.io/courses/getting-started-with-redux)
- [Redux Thunk](https://github.com/gaearon/redux-thunk)
- [Great article with a nice real-life analogy of how Redux is important and helpful](http://almerosteyn.com/2016/08/redux-explained-again)
- But that doesn't mean we have to we have to use Redux for everything from now on. [There's also a good read about this from Dan Abramov himself](https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367)