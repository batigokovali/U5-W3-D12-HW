import Express from "express"
import cors from "cors"
import productsRouter from "./api/products/index.js"
import { badRequestHandler, notFoundHandler, genericErrorHandler } from "./errorHandlers.js"

const server = Express()

// ************************************* MIDDLEWARES **********************************
server.use(cors())
server.use(Express.json())

// ************************************** ENDPOINTS ***********************************
server.use("/products", productsRouter)

// ************************************* ERROR HANDLERS *******************************
server.use(badRequestHandler)
server.use(notFoundHandler)
server.use(genericErrorHandler)

export default server
