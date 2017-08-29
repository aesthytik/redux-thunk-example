import { combineReducers } from 'redux';
import { items, itemsHaveError, itemsAreLoading } from './items';

export default combineReducers({
    items,
    itemsHaveError,
    itemsAreLoading
});
