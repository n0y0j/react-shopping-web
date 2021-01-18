const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const config = require('./config/key')

const { User } = require("./models/User")
const { auth } = require('./middleware/auth')

// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}))

// application/json
app.use(bodyParser.json())
app.use(cookieParser())

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
  useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err))


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/api/hello', (req, res) => {
  res.send('test')
})

app.post('/api/users/register', (req, res) => {
  // 회원가입 시 필요한 정보를 client에서 가져와 그것들을 데이터 베이스에 저장
  const user = new User(req.body)

  user.save((err, userInfo) => {
    if(err) return res.json({success: false, err})
    return res.status(200).json({success: true})
  })

})

app.post('/api/users/login', (req, res) => {
  // 1. 요청된 이메일을 데이터베이스에 있는지 찾음
  User.findOne({email: req.body.email}, (err, user) => {
    if (!user) {
      console.log(user)
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다."
      })
    }

      // 2. 요청된 이메일이 데이터베이스에 있다면 비밀번호를 확인
      user.comparePassword(req.body.password, (err, isMatch) => {
        if(!isMatch) return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다." })

        // 3. 비밀번호가 맞다면 토근 생성
        user.generateToken((err, user) => {
          if (err) return res.status(400).send(err)

          // 토큰을 쿠키에 저장
          res.cookie("x_auth", user.token)
            .status(200)
            .json({ loginSuccess: true, userId: user._id })
        })
      })
  })
})

app.get('/api/users/auth', auth, (req, res) => {
  // auth 미들웨어 통과 시 Authentication = true
  // role 1 admin, role 0 일반 유저
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image
  })
})

app.get('/api/users/logout', auth, (req, res) => {
  User.findOneAndUpdate({
    _id: req.user._id
  }, {token: ''}
  , (err, user) => {
    if (err) return res.json({ success: false, err});
    return res.status(200).send({
      success: true
    })
  })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})