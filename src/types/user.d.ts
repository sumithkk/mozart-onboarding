interface IUserSignUpInfo {
    email: string
    password: string
    firstName: string
    lastName: string
    country: string
    planName: string
    quantity: string
    organizationName: string
}

interface IUserLoginInfo {
    email: string
    password: string
}

interface IUpdateUserInfo {
    whatToUpdate: "userInfo"
    username: string
    name: string
    email: string
    role: string
    profilePicture: string
}

interface IUpdatePasswordViaRestToken {
    token?: string
    password: string
    isFromSettingsPage?: boolean
}

interface IMatter {
    matterId: string
    name: string
    description: string
    clientName: string
    documents: string[]
    tags: string[]
}
