const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

morgan.token('body-data', (req) => {
  const body = req.body;
  return body && Object.keys(body).length ? JSON.stringify(body) : '{}';
});


//Middlewares
app.use(express.json())
app.use(morgan('tiny'))
app.use(morgan(customLogger))
app.use(cors())

app.use(express.static('dist')) //app.use(express.static('dist'))

//Custum function to be used in Morgan 
function customLogger(tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens['response-time'](req, res), 'ms',
    'body:', tokens['body-data'](req, res)
  ].join(' ');
}

//Phonebook data
let data = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"},
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

//Phonebook data
app.get('/api/persons', (req, res) => {
	res.json(data)
})

//Phonebook info / date
let users = 0
app.get('/info', (req, res) => {
	users += 1
	const today = new Date()
	res.send(`<div>
              <p>Phonebook has info for ${users}</p>
              <p>${today.toString()}</p>
            </div>`)
})

//Fetch a resource
app.get('/api/persons/:id', (req, res) => {
  const id = req.params.id
  const phone = data.find(v => v.id === id)
  if(phone) res.json(phone)
  else res.status(404).end()
})

//Delete a resource
app.delete('/api/persons/:id', (req, res) => {
  const id = req.params.id 
  data = data.filter(phone => phone.id !== id)
  res.status(204).end()
})

//Recieve a resource
function generate_id(){
  const len_data = data.length
  let id
  do {
    id = Math.floor(Math.random() * 1000)
  } while(id <= len_data || data.includes(id))
  
  return id.toString()
}
app.post('/api/persons', (req, res) => {
  const body = req.body
  
  if(!body.name){
    console.log('No name')
    return res.status(404).json({error: 'Name is missing'})
  }

  let new_phone = {
    'id' :  generate_id(),
    'name' : body.name,
    'number' : body.number
  }

  //Check uniqueness of name
  const unique_name = data.some(phone => body.name === phone.name)
  
  if(unique_name){
    return res.status(409).json({ error: 'name must be unique' })
  }

  data = data.concat(new_phone)
  console.log('After POST', data)
  res.json(data)
})
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`The server is running at port ${PORT}`)
})