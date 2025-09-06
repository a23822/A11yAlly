import { app } from './app';
import './lib/firebase';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`A11yAlly Server is running on port ${PORT}`);
});
