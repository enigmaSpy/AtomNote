import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;
const IconBase = ({children, ...props}:IconProps)=>(
    <svg
        viewBox="0 0 24 24"
        width="1em"
        height='1em'
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        arial-hidden="true"
        {...props}
    >
        {children}
    </svg>
)

export const AddElectronSVG =(props: IconProps)=>(
    <IconBase {...props}>
        <circle className="ic-entangle" cx="9" cy="15" r="5.5"/>
        <path className="ic-badge" d="M19 2.5v5M16.5 5h5"/>
    </IconBase>
);


export const AddCovalentAtomSVG = (props: IconProps)=>(
    <IconBase {...props}>
        <circle className="ic-entangle" cx="8" cy="15" r="5.5" />
        <circle className="ic-entangle" cx="16" cy="15" r="5.5" />
        <circle className="ic-entangle" cx="12" cy="13.5" r="1" fill="currentColor" stroke="none" />
        <circle className="ic-entangle" cx="12" cy="16.5" r="1" fill="currentColor" stroke="none" />
        <path className="ic-badge" d="M19 2.5v5M16.5 5h5" />
    </IconBase>
);

export const AddAtomBondSVG = (props: IconProps)=>(
    <IconBase {...props}>
        <circle className="ic-entangle" cx="4" cy="15" r="3" />
        <circle className="ic-entangle" cx="20" cy="15" r="3" />
        <circle className="ic-entangle" cx="4" cy="15" r="1" fill="currentColor" stroke="none" />
        <circle className="ic-entangle" cx="20" cy="15" r="1" fill="currentColor" stroke="none" />
        <path className="ic-entangle" d="M7 15c1.7-5 3.3-5 5 0s3.3 5 5 0" />
        <path className="ic-badge" d="M19 2.5v5M16.5 5h5" />
    </IconBase>
);