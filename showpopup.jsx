import moment from "moment";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";

const API_URL = "https://kriptokyng.com/api/blocks";

const Showpopup = () => {
  const [latestBlock, setLatestBlock] = useState(null);

  useEffect(() => {
    const fetchLatestBlock = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (data && data.length > 0) {
          const newBlock = data[0];
          const currentTime = new Date();
          const createdAt = new Date(newBlock.
            created
            );
          const timeDiff = currentTime.getTime() - createdAt.getTime(); 

          if (timeDiff >= 0 && timeDiff <= 600000) {
            if (!latestBlock || newBlock.blockHeight !== latestBlock.blockHeight) {
              setLatestBlock(newBlock);

              const timeAgo = moment(createdAt).fromNow();

              function WithAvatar() {
                return (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      paddingLeft: "2rem",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        zIndex: 10,
                        placeItems: "center",
                        position: "absolute",
                        left: "-3rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "5rem",
                        height: "5rem",
                        borderRadius: "50%",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        color: "white",
                      }}
                    >
                      <Image
                        src={`/images/coins/${newBlock.poolId.toLowerCase()}.png`}
                        alt="Coin Logo"
                        width={70}
                        height={70}
                      />
                    </div>
                    <p style={{ color: "white", fontWeight: "600", marginBottom: "5px" }}>
                      Block {newBlock.blockHeight}
                    </p>
                    <p style={{ color: "white", fontWeight: "600", marginBottom: "5px" }}>
                      Found {timeAgo} by:
                    </p>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "#a1a1aa",
                        marginBottom: "5px",
                      }}
                    >
                      {newBlock.miner}
                    </p>
                  </div>
                );
              }

              toast(WithAvatar, {
                closeButton: false,
                autoClose: 5000, // Toast will automatically close after 5 seconds
                className: "",
                style: {
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  overflow: "visible",
                  transform: "scale(1)",
                  borderRadius: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "1.5rem",
                  backgroundColor: "#1e293b",
                  color: "white",
                  border: "1px solid rgba(0, 0, 0, 0.05)",
                },
              });
            }
          }
        }
      } catch (error) {
        console.error("Error fetching blocks:", error);
      }
    };

    fetchLatestBlock();
    const interval = setInterval(fetchLatestBlock, 30000); 

    return () => clearInterval(interval);
  }, [latestBlock]);

  return (
    <>
      <ToastContainer />
    </>
  );
};

export default Showpopup;