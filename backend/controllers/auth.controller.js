

const signUp = async (req, res) => {
    res.json({
      message: "Sign up endpoint",
    });
}


const signIn = async(req, res) => {
    res.json({
      message: "Sign in endpoint",
    });
}


const logout = async(req, res) => {
    res.json({
      message: "Logout endpoint",
    });
}


export { signUp, signIn, logout };