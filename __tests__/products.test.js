// By default Jest does not work with the import syntax
// If you want to use import syntax you should add NODE_OPTIONS=--experimental-vm-modules to the test script in package.json
// On Windows you cannot use NODE_OPTIONS (as well as other env vars in scripts) from the command line --> solution is to use cross-env in order to be able to pass
// env vars to command line scripts on all operative systems!
import supertest from "supertest"
import dotenv from "dotenv"
import mongoose from "mongoose"
import server from "../src/server.js"
import ProductsModel from "../src/api/products/model.js"

dotenv.config() // This command forces .env vars to be loaded into process.env. This is the way to go when you can't use -r dotenv/config

// supertest is capable of running server.listen from our Express app if we pass the server to it
// It will give us back an object (client) that can be used to run http requests on that server
const client = supertest(server)

const validProduct = {
  name: "iPhone SE",
  description: "Good phone",
  price: 9001
}

const notValidProduct = {
  description: "Good phone",
  price: 10000
}

let validProductID;
let invalidProductID = "6436b60c28268a437baf0b7e"

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_TEST_URL)
  const product = new ProductsModel(validProduct)
  await product.save()
  const { _id } = await product.save()
  validProductID = _id.toString()
}) // beforeAll is a Jest hook which will be ran before all tests, usually this is used to connect to db and to do some initial setup like adding some mock data to the db

afterAll(async () => {
  await ProductsModel.deleteMany()
  await mongoose.connection.close()
}) // afterAll hook could to clean up the situation (close the connection to Mongo gently and clean up db/collections)

describe("Test Products APIs", () => {
  it("Should test that env vars are loaded correctly", () => {
    expect(process.env.MONGO_TEST_URL).toBeDefined()
  })

  test("Fetching on /products should return a success status code and a body", async () => {
    const res = await client.get("/products").expect(200)
    expect(res.body).toBeDefined()
    expect(res.statusCode)
  })

  test("Create new product on /products should return a valid _id and 201 if the product is valid", async () => {
    const res = await client.post("/products").send(validProduct).expect(201)
    expect(res.body._id).toBeDefined()
  })

  test("Create new product on /products should return a 400 if the product is invalid", async () => {
    const res = await client.post("/products").send(notValidProduct).expect(400)
  })

  test("Fetching on /products/:productID endpoint expect requests to return the correct product with a valid id", async () => {
    const res = await client.get(`/products/${validProductID}`).expect(200)
    expect(res.body._id).toBe(validProductID)
  })

  test("Fetching on /products/:productID endpoint expect requests to be 404 if productID does not exist", async () => {
    const res = await client.get(`/products/${invalidProductID}`).expect(404)
    expect(res.body.message).toBe(`Product with id ${invalidProductID} not found!`)
  })

  test("Deleting the /products/:productID endpoint expect successful 204", async () => {
    const res = await client.delete(`/products/${validProductID}`).expect(204)
  })

  test("Deleting the /products/:productID endpoint with non-existing ID expect 404", async () => {
    const res = await client.delete(`/products/${invalidProductID}`).expect(404)
    expect(res.body.message).toBe(`Product with id ${invalidProductID} not found!`)
  })

  test("when updating /product/:productID endpoint expect requests to be accepted", async () => {
    const res = await client.put(`/products/${validProductID}`).send({ name: "Kelek" }).expect(200)
  })

  test("when updating /product/:productID endpoint with non-existing ID expect 404", async () => {
    const res = await client.put(`/products/${invalidProductID}`).send({ name: "Kelek" }).expect(404)
  })

  test("when updating /product/:productID endpoint expect response.body.name to be changed", async () => {
    const res = await client.put(`/products/${validProductID}`).send({ name: "Kelek" }).expect(200)
    expect(res.body.name).not.toBe(validProduct.name)
  })

  test("when updating /product/:productID endpoint expect the typeof name in response.body to be “string”", async () => {
    const res = await client.put(`/products/${validProductID}`).send({ name: "Kelek" }).expect(200)
    expect(typeof res.body.name).toBe("string")
  })

  //Invention
  test("when updating /product/:productID endpoint expect the response.body.name to include letter b ", async () => {
    const res = await client.put(`/products/${validProductID}`).send({ name: "Kelek" }).expect(200)
    expect(res.body.name).toMatch(/k/)
  })

  test("when updating /product/:productID endpoint expect the typeof price in response.body to be “number”", async () => {
    const res = await client.put(`/products/${validProductID}`).send({ price: 5000 }).expect(200)
    expect(typeof res.body.price).toBe("number")
  })
})
