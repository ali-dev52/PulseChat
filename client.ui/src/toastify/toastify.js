import { Bounce, Flip, Zoom, toast } from 'react-toastify';

const warningtoast = (arg) => {
  toast.warning(arg, {
    position: 'top-center',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: 'dark',
    transition: Bounce,
  });
};

const errortoast = (arg) => {
  toast.error(arg, {
    position: 'top-center',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: 'dark',
    transition: Zoom,
  });
};

const successtoast = (arg) => {
  toast.success(arg, {
    position: 'top-center',
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: 'dark',
    transition: Flip,
  });
};

const infotoast = (arg) => {
  toast.info(arg, {
    position: 'top-left',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: 'dark',
    transition: Bounce,
  });
};

export { errortoast, infotoast, successtoast, warningtoast };
