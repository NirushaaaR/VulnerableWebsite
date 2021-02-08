import { useState } from 'react'
import { AUTHSTATE } from '../constants';
import { auth } from '../firebase';

const AuthForm = ({ authState }) => {

    const getBtnText = (state) => state === AUTHSTATE.SIGNIN ? "ล็อคอิน" : "สมัครสมาชิก";

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [text, setText] = useState(getBtnText(authState));

    const submitForm = async (e) => {
        e.preventDefault();
        setText("กำลังดำเนินการ")
        const submitBtn = document.getElementById("authSubmit");
        if (submitBtn) {
            submitBtn.disabled = true;
        }

        try {
            switch (authState) {
                case AUTHSTATE.SIGNIN:
                    await auth.signInWithEmailAndPassword(email, password);
                    break;
                case AUTHSTATE.REGISTER:
                    await auth.createUserWithEmailAndPassword(email, password);
                    break;
                default:
                    setError(`state ${authState} ผิดพลาด`)
                    break;
            }
        } catch (error) {
            setError(error.message);
        }

        setText(getBtnText(authState));
        if (submitBtn) {
            submitBtn.disabled = false;
        }
    };

    return (
        <div className="login-form">
            <form onSubmit={submitForm}>
                <h2 className="text-center">{authState}</h2>
                <div className="form-group">
                    <div className="input-group">
                        <div className="input-group-prepend">
                            <span className="input-group-text">
                                <span className="fa fa-user"></span>
                            </span>
                        </div>
                        <input type="email" className="form-control" name="email" placeholder="Email" required="required"
                            value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                </div>
                <div className="form-group">
                    <div className="input-group">
                        <div className="input-group-prepend">
                            <span className="input-group-text">
                                <i className="fa fa-lock"></i>
                            </span>
                        </div>
                        <input type="password" className="form-control" name="password" placeholder="Password" required="required"
                            value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                </div>

                {error ? (<div className="alert alert-danger text-center" role="alert">
                    Error: {error}
                </div>) : null}


                <div className="form-group">
                    <button id="authSubmit" type="submit" className="btn btn-primary login-btn btn-block">{text}</button>
                </div>
            </form>
        </div>
    );
};

const Auth = () => {

    const [authState, setAuthState] = useState(AUTHSTATE.SIGNIN);

    return (
        <div>
            <AuthForm authState={authState} />
            <hr />
            <div className="text-center mt-6">
                {
                    authState === AUTHSTATE.SIGNIN
                        ? (<div>
                            ยังไม่ได้สมัครสมาชิก?{" "}
                            <a className="btn btn-primary" onClick={() => setAuthState(AUTHSTATE.REGISTER)}>คลิกที่นี่</a>
                        </div>)
                        : authState === AUTHSTATE.REGISTER
                            ? (<div>
                                เป็นสามาชิกแล้ว?{" "}
                                <a className="btn btn-primary" onClick={() => setAuthState(AUTHSTATE.SIGNIN)}>ล็อคอิน</a>
                            </div>)
                            : (<div>มีข้อผิดพลาดเกิดขึ้น</div>)
                }
            </div>
        </div>
    )
}

export default Auth
