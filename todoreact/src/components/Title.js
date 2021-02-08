import { auth } from '../firebase';

const Title = () => {

    const logout = async e => {
        await auth.signOut()
    }

    return (
        <>
            <div className="row m-1 p-4">
                <div className="col">
                    <div className="p-1 h1 text-primary text-center mx-auto display-inline-block">
                        <i className="fa fa-check bg-primary text-white rounded p-2"></i>
                        <u>สิ่งที่ต้องทำ!!</u>{" "}
                    </div>
                </div>
            </div>
            <div className="profile text-center">
                <span>email: {auth.currentUser ? auth.currentUser.email : "No user"} <button onClick={logout} className="btn btn-danger">ล็อคเอ้า</button></span>
                
            </div>
        </>
    )
}

export default Title
