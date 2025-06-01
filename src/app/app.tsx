"use client";

import { type Context, sdk } from "@farcaster/frame-sdk";
import { useCallback, useEffect, useState, useRef } from "react";
import Image from 'next/image';

import { getContract } from "thirdweb";
import { base, baseSepolia } from "thirdweb/chains";
import {
	useActiveAccount,
	useActiveWallet,
	useActiveWalletConnectionStatus,
	useConnect,
	useSendTransaction,
} from "thirdweb/react";
import { shortenAddress } from "thirdweb/utils";
import { EIP1193 } from "thirdweb/wallets";
import { Button } from "~/components/Button";
import { ThirdwebClient } from "~/constants";
import { claimTo } from "thirdweb/extensions/erc1155";

type TransactionResult = { transactionHash: string };

export default function App() {
	const [isSDKLoaded, setIsSDKLoaded] = useState(false);
	const [context, setContext] = useState<Context.FrameContext>();
	const { connect } = useConnect();
	const wallet = useActiveWallet();
	const status = useActiveWalletConnectionStatus();
	const account = useActiveAccount();
	const { mutate: sendTransaction } = useSendTransaction();
	const [transactionResultToken0, setTransactionResultToken0] = useState<TransactionResult | null>(null);
	const [transactionErrorToken0, setTransactionErrorToken0] = useState<Error | null>(null);
	const [transactionResultToken1, setTransactionResultToken1] = useState<TransactionResult | null>(null);
	const [transactionErrorToken1, setTransactionErrorToken1] = useState<Error | null>(null);
	const [mintQuantity, setMintQuantity] = useState(BigInt(1));
	const isTestnet = true; // Set to false for mainnet
	const chain = isTestnet ? baseSepolia : base;
	const baseScanUrl = isTestnet ? "https://sepolia.basescan.org/tx/" : "https://basescan.org/tx/";
	const [isPendingToken0, setIsPendingToken0] = useState(false);
	const [isPendingToken1, setIsPendingToken1] = useState(false);
	const [isHDChecked, setIsHDChecked] = useState(true);
	const [hasLiked] = useState(true);
	const [showReloadIcon, setShowReloadIcon] = useState(false);

	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	const connectWallet = useCallback(async () => {
		connect(async () => {
			// create a wallet instance from the Warpcast provider
			const wallet = EIP1193.fromProvider({ provider: sdk.wallet.ethProvider });

			// trigger the connection
			await wallet.connect({ client: ThirdwebClient, chain: chain });

			// return the wallet to the app context
			return wallet;
		});
	}, [connect,chain]);

	useEffect(() => {
		const load = async () => {
			setContext(await sdk.context);
			sdk.actions.ready({});
		};
		if (sdk && !isSDKLoaded) {
			setIsSDKLoaded(true);
			load();
			if (sdk.wallet) {
				connectWallet();
			}
		}
	}, [isSDKLoaded, connectWallet]);

	useEffect(() => {
		if (context?.user.pfpUrl && canvasRef.current) {
			const canvas = canvasRef.current;
			const ctx = canvas.getContext("2d");
			if (ctx) {
				const imgElement = document.createElement('img');
				imgElement.src = context.user.pfpUrl;
				imgElement.onload = () => {
					const resolution = isHDChecked ? 96 : 24;
				
					// Create an offscreen canvas to downscale if needed
					const offscreen = document.createElement('canvas');
					offscreen.width = resolution;
					offscreen.height = resolution;
					const offCtx = offscreen.getContext('2d');
				
					if (offCtx) {
						offCtx.drawImage(imgElement, 0, 0, resolution, resolution);
					}
				
					// Now draw to main canvas at 96x96
					canvas.width = 96;
					canvas.height = 96;
					ctx.drawImage(offscreen, 0, 0, 96, 96);
				};
			}
		}
	}, [context?.user.pfpUrl, isHDChecked]);

	useEffect(() => {
		const timer = setTimeout(() => {
			setShowReloadIcon(true);
		}, 5000);
		return () => clearTimeout(timer);
	}, []);

	const handleButtonClick = () => {
		setTransactionErrorToken0(null);
		setTransactionErrorToken1(null);
	};

	const openTransactionUrl = async (transactionHash: string) => {
		const url = `${baseScanUrl}${transactionHash}`;
		await sdk.actions.openUrl(url);
	};

	return (
		<main className="bg-slate-900 h-screen w-screen text-white">
			<div className="w-[300px] mx-auto py-4 px-2 pt-32">
				<div className="flex flex-col items-center gap-2 mb-8">
					<div className="relative w-full mb-8">
						<Image src="/images/WeCastPro_XSmall.jpg" alt="WeCastPro" className="w-full p-4" width={100} height={100} />
						<div className="absolute inset-0 flex items-center justify-center">
							<Image
								src="/images/WeCastPro_NoDelay.gif"
								alt="WeCastPro gif"
								className="w-full h-full object-cover"
								width={100}
								height={100}
								onClick={(e) => {
									const img = e.currentTarget;
									img.src = `/images/WeCastPro_NoDelay.gif?${new Date().getTime()}`;
									setShowReloadIcon(false);
									setTimeout(() => {
										setShowReloadIcon(true);
									}, 7000);
								}}
							/>
							{showReloadIcon && (
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="absolute bottom-2 right-2 h-6 w-6 text-white opacity-50"
									fill="none"
									viewBox="0 0 489.533 489.533" 
									stroke="currentColor"
									strokeWidth={2}
								>
										<path d="M268.175,488.161c98.2-11,176.9-89.5,188.1-187.7c14.7-128.4-85.1-237.7-210.2-239.1v-57.6c0-3.2-4-4.9-6.7-2.9
		l-118.6,87.1c-2,1.5-2,4.4,0,5.9l118.6,87.1c2.7,2,6.7,0.2,6.7-2.9v-57.5c87.9,1.4,158.3,76.2,152.3,165.6
		c-5.1,76.9-67.8,139.3-144.7,144.2c-81.5,5.2-150.8-53-163.2-130c-2.3-14.3-14.8-24.7-29.2-24.7c-17.9,0-31.9,15.9-29.1,33.6
		C49.575,418.961,150.875,501.261,268.175,488.161z"/>
								</svg>
							)}
						</div>
						<div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
							{context?.user.pfpUrl ? (
								<canvas ref={canvasRef} className="object-cover size-full border-4 border-white" width={96} height={96} />
							) : (
								<div className="flex items-center justify-center size-full bg-slate-800 animate-pulse rounded-full" />
							)}
						</div>
					</div>
					<div className="w-full flex justify-center items-center text-center">
						{context?.user.displayName ? (
							<h1 className="text-2xl font-bold text-center">
								{context?.user.displayName}
								{isHDChecked ? "HD" : "SD"}
							</h1>
						) : (
							<div className="animate-pulse w-36 m-auto h-8 bg-slate-800 rounded-md" />
						)}
					</div>
					{account?.address && (
						<div className="w-full flex justify-center items-center text-center">
							<p className="text-base text-slate-500">
								{shortenAddress(account.address)}
							</p>
						</div>
					)}
				</div>

				<div className="flex justify-stretch flex-col gap-2">
					<label className="flex items-center gap-2">
						<span>SD</span>
						<input
							type="checkbox"
							checked={isHDChecked}
							onChange={(e) => setIsHDChecked(e.target.checked)}
							className="toggle-switch"
						/>
						<span>HD</span>
					</label>
					{!wallet ? (
						<Button disabled={!isSDKLoaded} onClick={connectWallet}>
							{status === "connecting" ? "Connecting..." : "Connect Wallet"}
						</Button>
					) : (
						<>
							{/* <Button disabled={!isSDKLoaded} onClick={wallet.disconnect}>
								Disconnect Wallet
							</Button> */}
							{isHDChecked ? (
								<Button
									disabled={!isSDKLoaded || isPendingToken1}
									onClick={async () => {
										handleButtonClick();
										setIsPendingToken1(true);
										if (!account) {
											alert("Minting failed: No account connected");
											return;
										}

										if (wallet.getChain()?.id !== chain.id) {
											await wallet.switchChain(chain);
										}

										const contract = getContract({
											client: ThirdwebClient,
											chain,
											address: "0xC03b765c06880CFB5a439240aC863826292767A5",
										});

										const transaction = claimTo({
											contract,
											to: account.address,
											tokenId: BigInt(1),
											quantity: mintQuantity,
										});

										sendTransaction(transaction, {
											onSuccess: (data: TransactionResult) => {
												setTransactionResultToken1(data);
												console.log(`Transaction successful with hash: ${data.transactionHash}`);
											},
											onError: (error: Error) => {
												setTransactionErrorToken1(error);
												console.error("Transaction failed", error);
											},
											onSettled: () => {
												setIsPendingToken1(false);
											},
										});
									}}
								>
									{isPendingToken1 ? "Minting Token 1..." : "HD Mint 0.002ETH Token 1"}
								</Button>
							) : (
								<Button
									disabled={!isSDKLoaded || isPendingToken0 || !hasLiked}
									onClick={async () => {
										handleButtonClick();
										setIsPendingToken0(true);
										if (!account) {
											alert("Minting failed: No account connected");
											return;
										}

										if (wallet.getChain()?.id !== chain.id) {
											await wallet.switchChain(chain);
										}

										const contract = getContract({
											client: ThirdwebClient,
											chain,
											address: "0xC03b765c06880CFB5a439240aC863826292767A5",
										});

										const transaction = claimTo({
											contract,
											to: account.address,
											tokenId: BigInt(0),
											quantity: mintQuantity,
										});

										sendTransaction(transaction, {
											onSuccess: (data: TransactionResult) => {
												setTransactionResultToken0(data);
												console.log(`Transaction successful with hash: ${data.transactionHash}`);
											},
											onError: (error: Error) => {
												setTransactionErrorToken0(error);
												console.error("Transaction failed", error);
											},
											onSettled: () => {
												setIsPendingToken0(false);
											},
										});
									}}
								>
									{isPendingToken0 ? "Minting Token 0..." : hasLiked ? "FreeMint Token 0" + {hasLiked}: "Like to Mint"}
								</Button>
							)}
							{transactionErrorToken0 && (
								<p className="text-red-500">
									{transactionErrorToken0.message}
								</p>
							)}
							{transactionResultToken0 && (
								<p className="text-green-500">
									Sent tx:{" "}
									<a
										href="#"
										onClick={(e) => {
											e.preventDefault();
											openTransactionUrl(transactionResultToken0.transactionHash);
										}}
									>
										{transactionResultToken0.transactionHash.slice(0, 6)}...
										{transactionResultToken0.transactionHash.slice(-4)}
									</a>
								</p>
							)}
							{transactionErrorToken1 && (
								<p className="text-red-500">
									{transactionErrorToken1.message}
								</p>
							)}
							{transactionResultToken1 && (
								<p className="text-green-500">
									Sent tx:{" "}
									<a
										href="#"
										onClick={(e) => {
											e.preventDefault();
											openTransactionUrl(transactionResultToken1.transactionHash);
										}}
									>
										{transactionResultToken1.transactionHash.slice(0, 6)}...
										{transactionResultToken1.transactionHash.slice(-4)}
									</a>
								</p>
							)}
							<div className="flex items-center gap-2">
								<button
									className="bg-gray-700 text-white px-2 py-1 rounded"
									onClick={() => {
										handleButtonClick();
										setMintQuantity((prev) => prev > BigInt(1) ? prev - BigInt(1) : prev);
									}}
								>
									-
								</button>
								<span className="text-white">{mintQuantity.toString()}</span>
								<button
									className="bg-gray-700 text-white px-2 py-1 rounded"
									onClick={() => {
										handleButtonClick();
										setMintQuantity((prev) => prev + BigInt(1));
									}}
								>
									+
								</button>
							</div>
						</>
					)}
				</div>
				<div className="flex justify-center mt-4">
					<a
						onClick={() => {
							sdk.actions.openUrl('https://ipfs.io/ipfs/QmV67MbiP3c3ADTKK9FyCEr7Gcwdh3JrR68t1fKJsMYvGT/0.jpeg');
						}}
						className="text-blue-500 underline cursor-pointer px-4 py-2"
					>
						Explore Artwork HD
					</a>
					<a
						onClick={() => {
							sdk.actions.openUrl('https://ipfs.io/ipfs/QmdwMawNRtWMkQoYXrMEjsFnW7DQRm84gV7X84hbK1gkbK/1.jpg');
						}}
						className="text-blue-500 underline cursor-pointer px-4 py-2"
					>
						Explore Artwork SD
					</a>
					<a
						onClick={() => {
							sdk.actions.openUrl('https://opensea.io/collection/wecast');
						}}
						className="text-blue-500 underline cursor-pointer px-4 py-2"
					>
						View OG WeCast April 2025
					</a>
				</div>
			</div>
			<style jsx>{`
				.toggle-switch {
					position: relative;
					width: 40px;
					height: 20px;
					-webkit-appearance: none;
					background-color: #c6c6c6;
					outline: none;
					border-radius: 20px;
					transition: background-color 0.2s;
					cursor: pointer;
				}
				.toggle-switch:checked {
					background-color: #855DCD;
				}
				.toggle-switch:before {
					content: '';
					position: absolute;
					width: 18px;
					height: 18px;
					border-radius: 50%;
					top: 1px;
					left: 1px;
					background-color: #fff;
					transition: transform 0.2s;
				}
				.toggle-switch:checked:before {
					transform: translateX(20px);
				}
			`}</style>
		</main>
	);
}
