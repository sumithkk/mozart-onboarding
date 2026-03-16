import mitt from "mitt"
const emitter = mitt<IEventTypes>()
export default emitter
