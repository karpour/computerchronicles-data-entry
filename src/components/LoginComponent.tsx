import { Component } from "react";

export type LoginComponentProps = {
    loggedIn: boolean;
    userName: string | null;
    showBackButton: boolean;
    onBack: () => void;
};

export default class LoginComponent extends Component<LoginComponentProps> {

    public render() {
        return (<div className="login-header grid-element">
            {this.props.showBackButton && (<button onClick={this.props.onBack}>Back to menu</button>)}
            {this.props.loggedIn ?
                (<span>Logged in as {this.props.userName} <a href="/logout">[log out]</a></span>) :
                (<form action="/login" method="post">
                    <label>Login</label>
                    <input type="text" placeholder="Enter Username" name="username" required></input>
                    <input type="password" placeholder="Enter Password" name="password" required></input>
                    <button type="submit">Login</button>
                </form>)}
        </div>);
    }
}