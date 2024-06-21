import { UserAuth } from "../AuthContext";
import GoogleLogo from "./../assets/google-logo.svg";
import { Link } from "react-router-dom";
import * as Yup from "yup";
import { useFormik } from "formik";
import { auth } from "../config/Firebase.ts";
import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useNavigate } from "react-router-dom";

function SignUp() {
  const navigate = useNavigate();

  const { googleSignIn } = UserAuth();
  const [firstname, ] = useState<string>("");
  const [lastname, ] = useState<string>("");
  const [email, ] = useState<string>("");
  const [password, ] = useState<string>("");

  const schema = Yup.object().shape({
    firstname: Yup.string()
      .required("First Name is required")
      .min(3, 'First Name must be atleast 3 characters'),
    lastname: Yup.string()
      .required("Last Name is required")
      .min(3, 'Last Name must be atleast 3 characters'),
    email: Yup.string()
      .required("Email is required")
      .email('Not a valid email'),
    password: Yup.string()
      .required("Password is required")
      .min(8, 'Password must be atleast 8 characters'),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      firstname: firstname,
      lastname: lastname,
      email: email,
      password: password,
    },
    onSubmit: async (values) => {

      await createUserWithEmailAndPassword(auth, values.email, values.password)
      .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(errorCode, errorMessage);
      });

      if (auth.currentUser != null) {
        await updateProfile(auth.currentUser, {
          displayName: `${values.firstname} ${values.lastname}`,
        }).then(() => {
            navigate("/");
        }).catch((error) => {
            console.log("error updating name");
            console.log(error);
        });
      }
    },
    validationSchema: schema,
  });

  const handleGoogleSignIn = () => {
    try {
      googleSignIn();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex h-screen w-full mx-auto gap-2">
      <div className=" lg:w-1/2 w-full h-full size-fit">
        <div className="w-1/2 mx-auto my-auto h-full">
          <h1 className="text-justify text-2xl py-2 pt-20 text-gray-700">
            Sign Up
          </h1>


          <button
            type="button"
            className=" w-full p-2 rounded hover:bg-gray-50 hover:text-gray-50 border text-slate-300"
            onClick={handleGoogleSignIn}
          >
            <div className="flex items-center justify-center">
              <div className="p-1 pr">
                <img
                  src={GoogleLogo}
                  alt="google logo"
                  width={25}
                  height={25}
                />
              </div>
              <div className="text-gray-600 text-sm ">Sign up with Google</div>
            </div>
          </button>

          <div className="text-xs text-gray-500 text-center py-6">
            ------------- or Sign up with Email -------------
          </div>

          <form onSubmit={formik.handleSubmit}>
            <div className="mb-5">
              <label
                htmlFor="firstname"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                First Name
              </label>
              <input
                type="text"
                id="firstname"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="First Name"
                value={formik.values.firstname}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <div className="text-sm text-red-400">
                {formik.errors.firstname && formik.touched.firstname && formik.errors.firstname}
              </div>
            </div>
            <div className="mb-5">
              <label
                htmlFor="lastname"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Last Name
              </label>
              <input
                type="text"
                id="lastname"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Last Name"
                value={formik.values.lastname}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <div className="text-sm text-red-400">
                {formik.errors.lastname && formik.touched.lastname && formik.errors.lastname}
              </div>
            </div>
            <div className="mb-5">
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="mail@abc.com"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <div className="text-sm text-red-400">
                {formik.errors.email && formik.touched.email && formik.errors.email}
              </div>
            </div>
            <div className="mb-5">
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="*********"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <div className="text-sm text-red-400">
                {formik.errors.password && formik.touched.password && formik.errors.password}
              </div>
            </div>
            <button
              type="submit"
              className="text-white bg-primary-700 hover:bg-primary-600 focus:ring focus:outline-none focus:ring-primary-800 font-medium rounded text-sm w-full px-5 py-2.5 mt-5 text-center"
            >
              Sign Up
            </button>
          </form>

          <div className="flex items-center justify-center pt-20">
            <div className="text text-gray-500 text-center py-6">
              Already have an account?
            </div>
            <Link
              to="/login"
              className="text pl-2 text-primary-600 hover:text-primary-400"
            >
              Sign in instead
            </Link>
          </div>
        </div>
      </div>
      <div className=" lg:w-1/2 hidden lg:block bg-sign-up bg-left bg-cover">
      </div>
    </div>
  );
}
SignUp.displayName = 'SignUp';

export default SignUp;
