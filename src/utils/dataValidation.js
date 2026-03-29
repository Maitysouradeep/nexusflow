// validate that a user can only access their own data

export const validateUserDataAccess = (requesterId, targetUserId, userRole) => {
    //Admin can access anyone's data
    if(userRole === 'admin'){
        return true;
    }

    //Regular users can only access their own data
    if (requesterId === targetUserId){
        return true;
    }
    return false;
};
//check if user is admin
export const isAdmin = (userRole) => {
    return userRole === 'admin';
};

// Sanitize user data based on role
export const sanitizeUserData = (userData, viewerRole, viewerId) => {
    if(viewerRole === 'admin'){
        //Admin see everything
        return userData;
    }
    if(viewerId === userData.uid){
        // User see their own data
        return userData;
    }

    //Hide sensitive info from unauthorised users 
    return{
        uid: userData.uid,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        email: userData.email,
    };
};