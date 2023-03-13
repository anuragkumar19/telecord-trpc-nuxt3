import { defineStore } from 'pinia'
import { parseTRPCError } from '~~/parseTRPCError'

export const useAuthStore = defineStore('auth', () => {
    const { $client } = useNuxtApp()
    const router = useRouter()

    const NINE_MINUTES_IN_SECONDS = 9 * 60
    const NINE_MINUTES_IN_MILLISECONDS = NINE_MINUTES_IN_SECONDS * 10000
    const FIFTY_YEARS_IN_SECONDS = 50 * 365 * 24 * 60 * 60

    const isLoggedIn = useState('isLoggedIn', () => false)

    const accessToken = useCookie('access_token', {
        maxAge: NINE_MINUTES_IN_SECONDS,
    })

    const accessTokenExpiryCookie = useCookie('access_token_expiry', {
        maxAge: NINE_MINUTES_IN_SECONDS,
    })

    const accessTokenExpiry = computed(() => {
        const expiry = Number(accessTokenExpiryCookie.value)

        if (isNaN(expiry)) {
            return null
        } else {
            return expiry
        }
    })

    const refreshToken = useCookie('refresh_token', {
        maxAge: FIFTY_YEARS_IN_SECONDS,
    })

    const logout = () => {
        isLoggedIn.value = false
        accessToken.value = null
        refreshToken.value = null
        accessTokenExpiryCookie.value = null
    }

    const getAccessToken = async () => {
        if (!refreshToken.value) {
            logout()
            return null
        }

        if (
            accessToken &&
            accessTokenExpiry.value &&
            accessTokenExpiry.value > Date.now()
        ) {
            return accessToken.value
        }

        try {
            const { tokens } = await $client.auth.refreshToken.mutate({
                refreshToken: refreshToken.value,
            })

            accessToken.value = tokens.accessToken
            accessTokenExpiryCookie.value = String(
                Date.now() + NINE_MINUTES_IN_MILLISECONDS
            )
            return tokens.accessToken
        } catch (err) {
            // const TRPCError = parseTRPCError(err)
            // if (TRPCError.isTRPCError && err.code === 'UNAUTHORIZED') {
            //     // Invalid Refresh Token
            //     logout()
            // }
            return null
        }
    }

    const fetchUser = async () => {
        const accessToken_ = await getAccessToken()

        if (!accessToken_) {
            return null
        }

        try {
            const u = await $client.user.me.query()
            return u
        } catch (err) {
            return null
        }
    }

    const {
        data: user,
        pending: loadingUser,
        refresh: refetchUser,
    } = useAsyncData(fetchUser)

    const login = async (input: { password: string; identifier: string }) => {
        const { tokens } = await $client.auth.login.mutate(input)

        accessToken.value = tokens.accessToken
        refreshToken.value = tokens.refreshToken
        accessTokenExpiryCookie.value = String(
            Date.now() + NINE_MINUTES_IN_MILLISECONDS
        )

        await refetchUser()

        return { tokens }
    }

    watch([isLoggedIn], () => {
        if (isLoggedIn.value) {
            router.push('/')
        } else {
            router.push('/auth/login')
        }
    })

    if (!refreshToken.value) {
        logout()
    }

    return {
        isLoggedIn,
        user,
        loadingUser,
        accessToken,
        accessTokenExpiry,
        refreshToken,
        login,
        logout,
        refetchUser,
        getAccessToken,
    }
})
