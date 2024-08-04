"use client";

import React, { LegacyRef, useEffect, useRef, useState } from "react";
import { RoomProvider, ClientSideSuspense } from "@liveblocks/react/suspense";
import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import { Editor } from "@/components/editor/Editor";
import Header from "@/components/Header";
import Loader from "./Loader";
import ActiveCollaborators from "./ActiveCollaborators";
import { Input } from "./ui/input";
import Image from "next/image";
import { updateDocument } from "@/lib/actions/room.actions";
import ShareModal from "./ShareModal";

const CollaborativeRoom = ({
	roomId,
	roomMetadata,
	users,
	currentUserType,
}: CollaborativeRoomProps) => {
	const [editing, setEditing] = useState(false);
	const [loading, setLoading] = useState(false);
	const [documentTitle, setDocumentTitle] = useState(roomMetadata.title);

	const containerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLDivElement>(null);

	const updateTitlehandler = async (
		e: React.KeyboardEvent<HTMLInputElement>
	) => {
		if (e.key === "Enter") {
			setLoading(true);
			try {
				if (documentTitle !== roomMetadata.title) {
					const updatedDocument = await updateDocument({
						roomId,
						title: documentTitle,
					});
					if (updatedDocument) {
						setEditing(false);
					}
				}
			} catch (error) {
				console.error("Error Updating Title", error);
			}
			setLoading(false);
		}
	};

	useEffect(() => {
		// setDocumentTitle(roomMetadata.title);
		const handleClickOutside = (e: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				setEditing(false);
				updateDocument({ roomId, title: documentTitle });
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [roomId, documentTitle]);
	useEffect(() => {
		if (editing && inputRef.current) {
			inputRef.current.focus();
		}
	}, [editing]);
	return (
		<RoomProvider id={roomId}>
			<ClientSideSuspense fallback={<Loader />}>
				<div className='collaborative-room'>
					<Header>
						<div
							ref={containerRef}
							className='flex w-fit items-center justify-center gap-2'
						>
							{editing && !loading ? (
								<Input
									type='text'
									value={documentTitle}
									ref={inputRef as LegacyRef<HTMLInputElement>}
									placeholder='Enter Title'
									onChange={(e) => setDocumentTitle(e.target.value)}
									onKeyDown={(e) => updateTitlehandler(e)}
									disabled={!editing}
									className='document-title-input'
								/>
							) : (
								<>
									<p className='document-title'>{documentTitle}</p>
								</>
							)}
							{currentUserType === "editor" && !editing && (
								<Image
									src='/assets/icons/edit.svg'
									alt='edit'
									width={24}
									height={24}
									className='pointer'
									onClick={() => setEditing(true)}
								/>
							)}

							{currentUserType !== "editor" && !editing && (
								<p className='view-only-tag'>View Only</p>
							)}

							{loading && <p className='text-em text-gray-400'>Saving...</p>}
						</div>
						<div className='flex w-full flex-1 justify-end gap-2 sm:gap-4'>
							<ActiveCollaborators />
							<ShareModal
								roomId={roomId}
								collaborators={users}
								creatorId={roomMetadata.creatorId}
								currentUserType={currentUserType}
							/>
						</div>
						<SignedOut>
							<SignInButton />
						</SignedOut>
						<SignedIn>
							<UserButton />
						</SignedIn>
					</Header>
					<Editor roomId={roomId} currentUserType={currentUserType} />
				</div>
			</ClientSideSuspense>
		</RoomProvider>
	);
};

export default CollaborativeRoom;
