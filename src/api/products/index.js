import express from "express"
import createHttpError from "http-errors"
import ProductsModel from "./model.js"

const productsRouter = express.Router()

productsRouter.post("/", async (req, res, next) => {
  try {
    const newProduct = new ProductsModel(req.body)
    const { _id } = await newProduct.save()
    res.status(201).send({ _id })
  } catch (error) {
    next(error)
  }
})

productsRouter.get("/", async (req, res, next) => {
  try {
    const product = await ProductsModel.find()
    res.send(product)
  } catch (error) {
    next(error)
  }
})

productsRouter.get("/:id", async (req, res, next) => {
  try {
    const product = await ProductsModel.findById(req.params.id)
    if (product) {
      res.send(product)
    } else {
      next(createHttpError(404, `Product with id ${req.params.id} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

productsRouter.put("/:id", async (req, res, next) => {
  try {
    const updatedProduct = await ProductsModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (updatedProduct) {
      res.send(updatedProduct)
    } else {
      next(createHttpError(404, `Product with id ${req.params.id} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

productsRouter.delete("/:id", async (req, res, next) => {
  try {
    const deletedProduct = await ProductsModel.findByIdAndUpdate(req.params.id)
    if (deletedProduct) {
      res.status(204).send()
    } else {
      next(createHttpError(404, `Product with id ${req.params.id} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

export default productsRouter
