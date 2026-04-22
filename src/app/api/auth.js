
export async function userLogin({ username, password }) {
    const BASE_URL = 'http://10.0.2.2:8000/api';
    const options = {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    };

    const response = await fetch(
        BASE_URL + '/login',
        options,
    );

    let data;
    try {
        data = await response.json();
    } catch (e) {
        data = null;
    }

    if (response.ok) {
        console.log('Login success response:', data);
        return data;
    } else {
        const message =
            (data && (data.errors?.password || data.errors?.detail || data.detail)) ||
            'Login failed';
        throw new Error(message);
    }
}
