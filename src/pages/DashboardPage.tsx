import { Link } from "react-router-dom";
import Modal from "../components/Modal";
import { useEffect, useState } from "react";
import { db } from "../config/Firebase";
import { getDocs, collection } from "firebase/firestore";

export interface AccountProps {
  id?: string;
  name: string;
  size: number;
  magic: string;
}

function DashboardPage() {
  const [accounts, setAccounts] = useState<AccountProps[]>([]);
  const getAccountList = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "accounts"));
      // @ts-ignore
      setAccounts(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getAccountList();
  }, []);

  return (
    <>
      <h1>Accounts</h1>

      {/* <div><Modal></Modal></div> */}

      <div>
        <div className="flex flex-wrap -mx-3 mb-5">
          <div className="w-full max-w-full px-3 mb-6  mx-auto">
            <div className="relative flex-[1_auto] flex flex-col break-words min-w-0 bg-clip-border rounded-[.95rem] bg-white m-5">
              <div className="relative flex flex-col min-w-0 break-words border border-dashed bg-clip-border rounded-2xl border-stone-200 bg-light/30">
                <div className="flex-auto block py-8 pt-6 px-9">
                  <div className="overflow-x-auto">
                    <table className="w-full my-0 align-middle text-dark border-neutral-200">
                      <thead className="align-bottom">
                        <tr className="font-semibold text-[0.95rem] text-secondary-dark">
                          <th className="pb-3 text-start min-w-[115px]">
                            Name
                          </th>
                          <th className="pb-3 text-end min-w-[50px]">Size</th>
                          <th className="pb-3 pr-12 text-end min-w-[115px]">
                            Magic
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {accounts ? (
                          accounts.map((account) => (
                            <tr
                              className="border-b border-dashed last:border-b-0"
                              key={account.id}
                            >
                              <td className="p-3 pl-0">
                                <div className="flex items-center">
                                  <div className="flex flex-col justify-start">
                                    <span className="mb-1 font-semibold transition-colors duration-200 ease-in-out text-lg/normal text-secondary-inverse hover:text-primary">
                                      {" "}
                                      {account.name}{" "}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 pr-0 text-end">
                                <span className="font-semibold text-light-inverse text-md/normal">
                                  {account.size}
                                </span>
                              </td>
                              <td className="p-3 pr-0 text-end">
                                <span className="text-center align-baseline inline-flex px-2 py-1 mr-auto items-center font-semibold text-base/none text-success bg-success-light rounded-lg">
                                  {" "}
                                  {account.magic}{" "}
                                </span>
                              </td>
                              {/* <td className="p-3 pr-12 text-end">
                                                                <span className="text-center align-baseline inline-flex px-4 py-3 mr-auto items-center font-semibold text-[.95rem] leading-none text-primary bg-primary-light rounded-lg"> {trade.profit} </span>
                                                            </td>
                                                            <td className="pr-0 text-start">
                                                                <span className="font-semibold text-light-inverse text-md/normal">{trade.date}</span>
                                                            </td> */}
                              <td className="p-3 pr-0 text-end">
                                <button className="ml-auto relative text-secondary-dark bg-light-dark hover:text-primary flex items-center h-[25px] w-[25px] text-base font-medium leading-normal text-center align-middle cursor-pointer rounded-2xl transition-colors duration-200 ease-in-out shadow-none border-0 justify-center">
                                  <span className="flex items-center justify-center p-0 m-0 leading-none shrink-0 ">
                                    <Link to={"/trade/" + account.id}>
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.5"
                                        stroke="currentColor"
                                        className="w-4 h-4"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M8.25 4.5l7.5 7.5-7.5 7.5"
                                        />
                                      </svg>
                                    </Link>
                                  </span>
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <div>No Account data</div>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DashboardPage;
