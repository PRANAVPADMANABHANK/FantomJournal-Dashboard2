import { User } from "../models/auth.models";

/**
 * @returns registered user list
 */
function getAllUsers(): User[] {
    // array in session storage for registered users
    let users: User[] = JSON.parse(sessionStorage.getItem('users')!) || [
        {
            id: 1, username: 'test', email: 'adminto@coderthemes.com', password: 'test', firstName: 'Nowak', lastName: 'Helme',
            avatar: 'assets/images/users/user-1.jpg', location: 'California, USA', title: 'Admin Head'
        }
    ];
    return users;
}


/**
 * Returns the current user
 */
function loggedInUser(): User | null {
    let user: User | null = {};
    user = JSON.parse(sessionStorage.getItem('currentUser')!);
    return user;
}

export { getAllUsers, loggedInUser }

