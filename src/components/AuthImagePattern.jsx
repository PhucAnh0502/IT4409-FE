import React from "react";
import { authImages } from "../constants";

const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="hidden lg:flex items-center justify-center bg-base-200 p-12">
      <div className="max-w-md text-center">
        <div className="grid grid-cols-3 gap-3 mb-8">
          {authImages.map((src, index) => {
            return (
              <div
                key={index}
                className={`aspect-square rounded-2xl bg-primary/20 ${ 
                  index % 2 == 0 ? "animate-pulse" : ""
                } flex items-center justify-center p-3`} 
              >
                <img
                  src={src}
                  alt={`Icon ${index}`}
                  className="w-6/6 h-6/6 object-contain" 
                />
              </div>
            );
          })}
        </div>
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-base-content/60">{subtitle}</p>
      </div>
    </div>
  );
};

export default AuthImagePattern;