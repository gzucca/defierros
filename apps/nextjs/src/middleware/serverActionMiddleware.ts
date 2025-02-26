import { cookies } from 'next/headers'
import { auth } from '@clerk/nextjs/server'

import { env } from '@defierros/env'
import type { Types } from '@defierros/types'

type ServerActionFunction<T, A extends any[] = any[]> = (...args: A) => Types.ServerActionPromise<T>

export function withServerActionTracking<T, A extends any[] = any[]>(
	actionName: string,
	fn: ServerActionFunction<T, A>,
): ServerActionFunction<T, A> {
	return async (...args: A): Types.ServerActionPromise<T> => {
		const sessionId = cookies().get('session_id')?.value
		const { userId } = await auth()
		const startTime = Date.now()

		try {
			// Log start of action
			if (env.NODE_ENV === 'production') {
				console.log(
					JSON.stringify({
						timestamp: new Date().toISOString(),
						type: 'server-action',
						action: actionName,
						event: 'started',
						sessionId,
						userId,
						args: args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : arg)),
					}),
				)
			}

			// Track in PostHog
			// if (userId) {
			// 	await PH_captureServerEvent(userId, `actions.${actionName}.started`, {
			// 		sessionId,
			// 		args: args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : arg)),
			// 	})
			// }

			// Execute the server action
			// const result = await fn(...(args as A))
			const result = await fn(...(args))

			// Calculate duration
			const duration = Date.now() - startTime

			// Log completion
			if (env.NODE_ENV === 'production') {
				console.log(
					JSON.stringify({
						timestamp: new Date().toISOString(),
						type: 'server-action',
						action: actionName,
						event: 'completed',
						sessionId,
						userId,
						duration,
						success: !result.error,
						error: result.error,
					}),
				)
			}

			// Track in PostHog
			// if (userId) {
			// 	await PH_captureServerEvent(userId, `${actionName}.completed`, {
			// 		sessionId,
			// 		duration,
			// 		success: !result.error,
			// 		error: result.error,
			// 	})
			// }

			return result
		} catch (error) {
			// Log error
			console.error(
				JSON.stringify({
					timestamp: new Date().toISOString(),
					type: 'server-action',
					action: actionName,
					event: 'error',
					sessionId,
					userId,
					error: error instanceof Error ? error.message : 'Unknown error',
					stack: error instanceof Error ? error.stack : undefined,
				}),
			)

			// Track in PostHog
			// if (userId) {
			// 	await PH_captureServerEvent(userId, `${actionName}.error`, {
			// 		sessionId,
			// 		error: error instanceof Error ? error.message : 'Unknown error',
			// 	})
			// }

			// Return error result instead of throwing
			return {
				error: {
					code: 'ServerActionError',
					message: error instanceof Error ? error.message : 'Unknown error',
				},
			}
		}
	}
}
