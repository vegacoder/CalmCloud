import * as SessionApiUtil from '../util/session_api_util';
export const RECEIVE_CURRENT_USER = 'RECEIVE_CURRENT_USER';
export const LOGOUT_CURRENT_USER = 'LOGOUT_CURRENT_USER';
export const RECEIVE_SESSION_ERRORS = 'RECEIVE_SESSION_ERRORS';
export const REMOVE_SESSION_ERRORS = 'REMOVE_SESSION_ERRORS';

export const receiveCurrentUser = ({ user, users, tracks }) => {
    return ({
        type: RECEIVE_CURRENT_USER,
        users: users ? users : {},
        user,
        tracks
    });
};

export const logoutCurrentUser = () => {
    return ({
        type: LOGOUT_CURRENT_USER,
    });
};

export const receiveSessionErrors = (errors) => {
    return ({
        type: RECEIVE_SESSION_ERRORS,
        errors: errors.responseJSON
    });
};

export const removeSessionErrors = () => {
    return ({
        type: REMOVE_SESSION_ERRORS
    });
};

export const fetchCurrentUser = username => dispatch => (
    SessionApiUtil.fetchCurrentUser(username)
        .then(user => dispatch(receiveCurrentUser(user)))
);

export const login = (user) => dispatch => {
    return (SessionApiUtil.login(user)
        .then(user => dispatch(receiveCurrentUser(user)))
        .fail(errors => dispatch(receiveSessionErrors(errors)))
    );
};

export const signup = (user) => dispatch => {
    return (SessionApiUtil.signup(user)
    .then(user => dispatch(receiveCurrentUser(user)))
    .fail(errors => dispatch(receiveSessionErrors(errors)))
    );
};

export const logout = () => dispatch => {
    return (SessionApiUtil.logout()
    .then(() => dispatch(logoutCurrentUser()))
    .fail(errors => dispatch(receiveSessionErrors(errors)))
    );
};