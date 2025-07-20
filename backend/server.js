const express = require('express');
const app = express();
const cors = require('cors');
const pool = require('./config/db'); 
const userRouter = require('./Routes/auth/userRouter');
const { minioClient } = require('./config/s3'); 
const extractorRoute = require('./Routes/extractor/extractorRoute');
const companyRouter = require('./Routes/company/companyRouter');
const applicationRoutes = require('./Routes/application/applicationRoutes');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/api', userRouter);
app.use('/api/extractor', extractorRoute);
app.use('/api/company', companyRouter);
app.use('/api/application', applicationRoutes);





app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
