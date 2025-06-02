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
// import { shortenAddress } from "thirdweb/utils";
import { EIP1193 } from "thirdweb/wallets";
import { Button } from "~/components/Button";
import { ThirdwebClient } from "~/constants";
import { claimTo } from "thirdweb/extensions/erc1155";

type TransactionResult = { transactionHash: string };

const MAX_MINT_QUANTITY = BigInt(5);
const TARGET_HASH = '0x3063a48af2bf4eb918e5466b2ab6756fa97bc179';
const TARGET_FID = '4163';
const FID = '5701';
const LIKE_CAST_URL = 'https://farcaster.xyz/kmacb.eth/0x3063a48a';

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
	const [showReloadIcon, setShowReloadIcon] = useState(false);
	const [imageSrc, setImageSrc] = useState("/images/WeCastPro.gif");
	const [userLikedCast, setUserLikedCast] = useState<boolean | null>(null);
	const [isCheckingLikeStatus, setIsCheckingLikeStatus] = useState(false);

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

	useEffect(() => {
		if (!isHDChecked) {
			setMintQuantity(BigInt(1));
		}
	}, [isHDChecked]);

	const handleButtonClick = () => {
		setTransactionErrorToken0(null);
		setTransactionErrorToken1(null);
	};

	const openTransactionUrl = async (transactionHash: string) => {
		const url = `${baseScanUrl}${transactionHash}`;
		await sdk.actions.openUrl(url);
	};

	const checkUserLikedCast = async (target_hash: string, target_fid: string, fid: string) => {
		try {
			const response = await fetch(`/api/checkUserLikedCast?target_hash=${target_hash}&target_fid=${target_fid}&fid=${fid}`);
			if (!response.ok) {
				throw new Error('Failed to check if user liked cast');
			}
			const data = await response.json();
			return data;
		} catch (error) {
			console.error('Error in checkUserLikedCast:', error);
			return null;
		}
	};

	// Example usage
	useEffect(() => {
		const fetchData = async () => {
			const result = await checkUserLikedCast(TARGET_HASH, TARGET_FID, FID);
			setUserLikedCast(result?.data?.reactionBody?.type === 'REACTION_TYPE_LIKE' ? true : false);
		};
		fetchData();
	}, []);

	return (
		<main className="bg-slate-900 h-screen w-screen text-white">
			<div className="w-[300px] mx-auto py-4 px-2 pt-16">
				<div className="flex flex-col items-center gap-2">
					<div className="relative w-full mb-8">
						<Image src="/images/WeCastPro_XSmall.jpg" alt="WeCastPro" className="w-full p-4" width={100} height={100} />
						<div className="absolute inset-0 flex items-center justify-center">
							<Image
								src={imageSrc}
								alt="WeCastPro gif"
								className="w-full h-full object-cover"
								width={100}
								height={100}
								onClick={() => {
									setImageSrc(`/images/WeCastPro_NoDelay.gif?${new Date().getTime()}`);
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
									fill="currentColor"
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
								<canvas ref={canvasRef} className={`object-cover size-full border-4 ${isHDChecked ? 'border-white' : 'border-purple-500'}`} width={96} height={96} />
							) : (
								<div className="flex items-center justify-center size-full bg-slate-800 animate-pulse rounded-full" />
							)}
						</div>
					</div>
				</div>

				<div className="flex justify-stretch flex-col gap-4">
					<div className="flex justify-between items-center gap-2">
						<div className="flex flex-col items-center gap-0 text-center">
							<span className="text-lg font-bold">SD</span>
							<span className="text-sm text-slate-400">Free Mint</span>
							<span className="text-sm text-slate-400">Pixelation</span>
						</div>
						<input
							type="checkbox"
							checked={isHDChecked}
							onChange={(e) => setIsHDChecked(e.target.checked)}
							className="toggle-switch align-top"
						/>
						<div className="flex flex-col items-center gap-0 text-center">
							<span className="text-lg font-bold">HD</span>
							<span className="text-sm text-slate-400">Paid Mint</span>
							<span className="text-sm text-slate-400">Sharp</span>
						</div>
					</div>
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
								<div className="flex items-center gap-2 w-full">
									<button
										className="bg-gray-700 text-white flex-grow px-0 py-2 rounded text-xl"
										style={{ height: '48px', width: '48px' }}
										onClick={() => {
											handleButtonClick();
											setMintQuantity((prev) => prev > BigInt(1) ? prev - BigInt(1) : BigInt(1));
										}}
									>
										-
									</button>
									<Button
										className="flex-grow"
										style={{ height: '48px', width: '200px' }}
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
													setIsHDChecked(true);
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
										{isPendingToken1 ? "Minting HD..." : `HD Mint ${(0.002 * Math.min(Number(mintQuantity), 5)).toFixed(3)}ETH`}
									</Button>
									<button
										className="bg-gray-700 text-white flex-grow px-0 py-2 rounded text-xl"
										style={{ height: '48px', width: '48px' }}
										onClick={() => {
											handleButtonClick();
											setMintQuantity((prev) => prev < MAX_MINT_QUANTITY ? prev + BigInt(1) : prev);
										}}
									>
										+
									</button>
								</div>
							) : (
								<Button
									className="flex-grow"
									style={{ height: '48px'}}
									disabled={!isSDKLoaded || isPendingToken0}
									onClick={async () => {
										handleButtonClick();
										if (!userLikedCast && !isCheckingLikeStatus) {
											setIsCheckingLikeStatus(true);
											await sdk.actions.openUrl(LIKE_CAST_URL);
											return;
										}
										if (isCheckingLikeStatus) {
	
											// Re-check the like status
											const result = await checkUserLikedCast(TARGET_HASH, TARGET_FID, FID);
											setUserLikedCast(result?.data?.reactionBody?.type === 'REACTION_TYPE_LIKE' ? true : false);
											setIsCheckingLikeStatus(false);
											return;
										}
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
												setIsHDChecked(true);
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
									{isPendingToken0 ? "Minting SD..." : isCheckingLikeStatus ? "Check Like Status" : userLikedCast === true ? "FreeMint SD" : "Like to Mint SD"}
								</Button>
							)}
							{transactionErrorToken0 && (
								<p className="text-red-500">
									{transactionErrorToken0.message}
								</p>
							)}
							{transactionResultToken0 && (
								<>
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
									<button
										className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
										onClick={async () => {

										}}
									>
										Share
									</button>
								</>
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
						</>
					)}
				</div>
				<div className="flex justify-center mt-4">
					{userLikedCast === null ? (
						<p className="text-white">Loading user like status...</p>
					) : userLikedCast === false ? (
						<a onClick={() => {
							setIsCheckingLikeStatus(true);
							sdk.actions.openUrl(LIKE_CAST_URL);
						}} className="text-white underline cursor-pointer">Like cast for free SD mint</a>
					) : null}
				</div>
				<div className="flex justify-center mt-4">
					<a
						onClick={() => {
							sdk.actions.openUrl('https://ipfs.io/ipfs/QmV67MbiP3c3ADTKK9FyCEr7Gcwdh3JrR68t1fKJsMYvGT/0.jpeg');
						}}
						className="text-purple-500 underline cursor-pointer px-4 py-2"
					>
						Explore Artwork HD
					</a>
					<span className="text-white mx-1 px-4 py-2">|</span>
					<a
						onClick={() => {
							sdk.actions.openUrl('https://ipfs.io/ipfs/QmdwMawNRtWMkQoYXrMEjsFnW7DQRm84gV7X84hbK1gkbK/1.jpg');
						}}
						className="text-purple-500 underline cursor-pointer px-4 py-2"
					>
						SD
					</a>
				</div>
				<div className="flex justify-center mt-2">
					<a
						onClick={() => {
							sdk.actions.openUrl('https://opensea.io/item/ethereum/0x9da2b6a88625be110e6da0eb7ed106ac88f6211d/1');
						}}
						className="text-gray-400 underline cursor-pointer px-4 py-2 text-sm"
					>
						View OG WeCast April 2023
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
