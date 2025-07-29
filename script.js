const { useState, useReducer, useContext, useEffect, createContext } = React;
const { render } = ReactDOM;

// Context
const actions = {
	increment: "INCREMENT_CURRENT",
	decrement: "DECREMENT_CURRENT",
	reset: "RESET_CURRENT",
	changeSession: "CHANGE_SESSION"
};

const initialContext = {
	current: "pomodoro",
	pomodoro: {
		name: "pomodoro",
		initialTime: 1500,
		timeLeft: 1500
	},
	break: {
		name: "break",
		initialTime: 300,
		timeLeft: 300
	}
};

const reducer = (state, action) => {
	const { current } = state;
	let result;

	switch (action.type) {
		case actions.increment:
			result = state[current].timeLeft + action.payload;
			return {
				...state,
				[current]: {
					...state[current],
					timeLeft: result > 3600 ? 3600 : result
				}
			};
		case actions.decrement:
			result = state[current].timeLeft - action.payload;
			return {
				...state,
				[current]: {
					...state[current],
					timeLeft: result <= 0 ? 0 : result
				}
			};
		case actions.reset:
			return {
				...state,
				[current]: {
					...state[current],
					timeLeft: state[current].initialTime
				}
			};
		case actions.changeSession:
			return {
				...state,
				current: current === "pomodoro" ? "break" : "pomodoro"
			};
		default:
			return state;
	}
};

const Context = createContext(initialContext);

const ContextProvider = ({ children }) => {
	const [state, dispatch] = useReducer(reducer, initialContext);
	return (
		<Context.Provider value={{ state, dispatch }}>{children}</Context.Provider>
	);
};

const formatTime = (time) => {
	const mins = String(Math.floor(time / 60)).padStart(2, "0");
	const secs = String(time % 60).padStart(2, "0");
	return { mins, secs };
};

const TimeLeft = ({ timeLeft }) => {
	const { mins, secs } = formatTime(timeLeft);
	return <p className="timer__time">{`${mins}:${secs}`}</p>;
};

const TimerPad = ({ active, setActive }) => {
	const { state, dispatch } = useContext(Context);

	return (
		<div className="timer__pad">
			<button
				type="button"
				className={`btn ${active ? "btn-red" : ""} pad__start`}
				onClick={() => setActive(!active)}
			>
				{active ? "Stop" : "Start"}
			</button>
			<button
				type="button"
				className="btn pad__plus-five"
				onClick={() => dispatch({ type: actions.increment, payload: 300 })}
			>
				+5 MIN
			</button>
			<button
				type="button"
				className="btn pad__minus-five"
				onClick={() => dispatch({ type: actions.decrement, payload: 300 })}
			>
				-5 MIN
			</button>
			<button
				type="button"
				className="btn pad__reset"
				onClick={() => {
					setActive(false);
					dispatch({ type: actions.reset });
				}}
			>
				Reset
			</button>
			<button
				type="button"
				className="btn pad__change"
				onClick={() => {
					setActive(false);
					dispatch({ type: actions.changeSession });
				}}
			>
				Change
			</button>
		</div>
	);
};

const Timer = () => {
	const { state, dispatch } = useContext(Context);
	const [isActive, setIsActive] = useState(false);

	const { current } = state;

	useEffect(() => {
		if (!isActive || state[current].timeLeft <= 0) return;

		const interval = setInterval(() => {
			dispatch({ type: actions.decrement, payload: 1 });
		}, 1000);

		return () => clearInterval(interval);
	}, [isActive, state[current].timeLeft]);

	return (
		<div>
			<div className="timer__card">
				<p className="timer__current">{current === "pomodoro" ? "Pomodoro Timer" : "Break"}</p>
				<TimeLeft timeLeft={state[current].timeLeft} />
			</div>
			<TimerPad active={isActive} setActive={setIsActive} />
		</div>
	);
};

const app = document.getElementById("app");
render(
	<ContextProvider>
		<Timer />
	</ContextProvider>,
	app
);
