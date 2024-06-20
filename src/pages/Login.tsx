import { UserAuth } from "../AuthContext";
import { Link } from "react-router-dom";
import * as Yup from "yup";
import { useFormik } from "formik";
import GoogleLogo from "./../assets/google-logo.svg";
import { useState } from "react";
import { auth } from "../config/Firebase.ts";
import { useNavigate } from "react-router-dom";

import {
  signInWithEmailAndPassword,
} from 'firebase/auth';

function LogIn() {
  const { googleSignIn } = UserAuth();
  const navigate = useNavigate();

  const [email, ] = useState<string>("");
  const [password, ] = useState<string>("");
  const [errors, setErrors] = useState<string>("");

  const emailSchema = Yup.object().shape({
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
      email: email,
      password: password,
    },
    onSubmit: (values) => {
      signInWithEmailAndPassword(auth, values.email, values.password)
            .then(() => {
                navigate("/");
            })
            .catch((error) => {
                const errorCode = error.code;
                if (errorCode == 'auth/wrong-password') {
                  setErrors('You have entered an invalid username or password');
                }
            });
    },
    validationSchema: emailSchema,
  });

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex h-screen w-full mx-auto gap-2">
      <div className=" lg:w-1/2 w-full h-full size-fit">
        <div className="w-1/2 mx-auto my-auto h-full">
          <h1 className="text-justify text-2xl py-2 pt-20 text-gray-700">
            Login to your Account
          </h1>

          <div className="text-gray-600 text-sm">
            Today is a new day. It's your day. You shape it.
          </div>
          <div className="text-gray-600 text-sm pb-10">
            Sign in to start managing your support tickets.
          </div>

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
              <div className="text-gray-600 text-sm">Sign in with Google</div>
            </div>
          </button>

          <div className="text-xs text-gray-500 text-center py-6">
            ------------- or Sign in with Email -------------
          </div>

          <form
            onSubmit={formik.handleSubmit}>
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
            <div className="flex items-start mb-5">
              <div className="flex items-center h-5">
                <input
                  id="remember"
                  type="checkbox"
                  value=""
                  className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800"
                />
              </div>
              <label
                htmlFor="remember"
                className="ms-2 text-sm font-medium text-gray-500"
              >
                Remember Me
              </label>
            </div>
            <div className="text-sm text-red-400">
                {errors}
              </div>
            <button
              type="submit"
              className="text-white bg-primary-700 hover:bg-primary-600 focus:ring focus:outline-none focus:ring-primary-800 font-medium rounded text-sm w-full px-5 py-2.5 mt-5 text-center"
            >
              Login
            </button>
          </form>

          <div className="flex items-center justify-center pt-20">
            <div className="text text-gray-500 text-center py-6">
              Not registered yet?
            </div>
            <Link
              to="/sign-up"
              className="text pl-2 text-primary-600 hover:text-primary-400"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
      <div className=" lg:w-1/2 hidden lg:block bg-hero-pattern bg-left bg-cover">
      </div>
    </div>
  );
}
LogIn.displayName = "LogIn";

export default LogIn;
