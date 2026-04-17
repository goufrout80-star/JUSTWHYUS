interface Props {
  size?: number
}

export default function LogoMark({ size = 32 }: Props) {
  return (
    <img
      src="/logo-mark.svg"
      alt="JUST WHY US"
      width={size}
      height={size}
      style={{ display: 'block' }}
    />
  )
}
