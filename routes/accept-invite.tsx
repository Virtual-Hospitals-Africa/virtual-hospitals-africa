import redirect from "../util/redirect.ts"

/* pseudo code
export const handler: LoggedInHealthWorkerHandler<
  { isAdmin: boolean }
> = {
  async GET(req, ctx) {
		if (notSignedIn) return redirect("first/ya/gotta/signin") // after sign in, you should get redirected here
    const invite_code = req.query.invite_code
    if (isCorrectCode(invite_code, ctx.state.session.data.email)) {
      await addToHealthWorkerAndEmploymentTable(ctx.state.trx, ctx.state.session.data)
      return redirect('/welcome-aboard')
    } else {
      throw new Error('Our princess is in another castle')
    }
  },
}
*/