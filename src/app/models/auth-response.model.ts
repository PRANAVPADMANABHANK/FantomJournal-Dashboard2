export interface AuthResponse {
    message: string;
    accessToken: string;
    refreshToken: string;
    user: {
        name: string;
        email: string;
    };
    // Add any other properties you expect from the response
}
