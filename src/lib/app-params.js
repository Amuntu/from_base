const isNode = typeof window === 'undefined';

const isClearAccessTokenRequested = () =>
	!isNode && new URLSearchParams(window.location.search).get("clear_access_token") === 'true';

const clearStoredAccessToken = () => {
	window.localStorage.removeItem('token');
}

const getAppParams = () => {
	if (isClearAccessTokenRequested()) {
		clearStoredAccessToken();
	}
	return {
		appId: 'local',
		token: !isNode ? window.localStorage.getItem('procureflow_local_current_user') : null,
		functionsVersion: null,
		appBaseUrl: window.location.origin,
	}
}


export const appParams = {
	...getAppParams()
}
