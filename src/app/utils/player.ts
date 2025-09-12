let currentUsername = "Anonymous";

export function setUsername(username: string) {
    currentUsername = username;
    localStorage.setItem("username", username);
}

export function getUsername(): string {
    return localStorage.getItem("username") || "Anonymous";
}

export function getCurrentUsername(): string {
    return currentUsername;
}