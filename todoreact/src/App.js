import { useContext, useEffect, useState } from 'react';

import Title from './components/Title';
import TodoList from './components/TodoList';
import Auth from './components/Auth';

import { UserProvider, UserContext } from "./providers/UserProvider";

const MainApp = () => {
  const context = useContext(UserContext);
  const [page, setPage] = useState("auth");

  useEffect(() => {

    console.log("context", context);

    if (context.user) {
      setPage("todo");
    } 
    else {
      setPage("auth");
    }
  }, [context]);

  return page === "auth"
    ? <Auth />
    : (
      <div>
        <Title />
        <TodoList />
      </div>
    )

}

function App() {
  return (
    <UserProvider>
      <div className="App container m-5 p-2 rounded mx-auto bg-light shadow">
        <MainApp />
      </div>
    </UserProvider>
  );
}

export default App;
