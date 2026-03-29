import React from "react";

export default function RoleBadge({role, size = 'medium'}){
    const sizeClasses = {
        small: 'px-2 py-1 text-xs',
        medium: 'px-3 py-2 text-sm',
        large: 'px-4 py-2 text-base',
    };

    const roleConfig = {
        admin: {
            bg:'bg-red-100',
            text:'text-red-800',
            icon: '👑',
            label: 'Admin',
        },
        user:{
            bg:'bg-blue-100',
            text:'text-blue-800',
            icon: '👤',
            label: 'User',
        },
    };

    const config = roleConfig[role] || roleConfig.user;

    return(
        <div className={`${config.bg} ${config.text}${sizeClasses[size]}`}>
            <span>{config.icon}</span>
            <span>{config.label}</span>
        </div>
    );

}
