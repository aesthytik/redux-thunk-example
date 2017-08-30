import axios from 'axios';

export function itemsHaveError(bool) {
    return {
        type: 'ITEMS_HAVE_ERROR',
        hasError: bool
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

export function itemsFetchData(url) {
    return (dispatch) => {
        dispatch(itemsAreLoading(true));

        // axios.get(url)
        //     .then((response) => {
        //         console.log("response", response.status);
        //         if (response.status !== 200) {
        //             throw Error(response.statusText);
        //         }

        //         dispatch(itemsAreLoading(false));

        //         return response;
        //     })
        //     //.then((response) => { console.log(response)})
        //     //.then((response) => response.data.json())
        //     .then((response) => { console.log(response.data)})
        //     .then((response) => dispatch(itemsFetchDataSuccess(response.data)))
        //     .catch(() => dispatch(itemsHaveError(true)));

         fetch(url)
             .then((response) => {
                    console.log("response", response);
                 if (!response.ok) {
                     throw Error(response.statusText);
                 }

                 dispatch(itemsAreLoading(false));

                 return response;
             })
             //.then((response) => { console.log(response.json())})
             .then((response) => response.json())
             .then((items) => dispatch(itemsFetchDataSuccess(items)))
             .catch(() => dispatch(itemsHaveError(true)));
    };
}
