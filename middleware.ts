import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
	'/',
	'/event/:id',
	'/event/:id/feedback',
	'/api/webhook/clerk',
	'/api/webhook/stripe',
	'/api/uploadthing',
	'/api/health',
	'/api/predict',
	'/api/feedback/template/:id',
	'/api/feedback/submit',
	'/api/cron/feedback-emails',
	'/track',
	'/gallery/:shareableLink',
	'/api/gallery/:galleryId/public',
]);

export default clerkMiddleware(async (auth, request) => {
	if (!isPublicRoute(request)) {
		await auth.protect();
	}
});

export const config = {
	matcher: [
		// Skip Next.js internals and all static files, unless found in search params
		'/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
		// Always run for API routes
		'/(api|trpc)(.*)',
	],
};
