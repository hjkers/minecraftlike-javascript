import { useFrame, useThree } from '@react-three/fiber';
import { useSphere } from '@react-three/cannon';
import { Vector3 } from 'three';
import { useEffect, useRef } from 'react';
import { useKeyboard } from '../hooks/useKeyboards';

const JUMP_FORCE = 5
const SPEED = 5

export const Player = () => {
    const {moveBackward,moveForward,moveLeft,moveRight,jump} = useKeyboard()

    const {camera} = useThree()
    const [ref, api] = useSphere(() => ({
        mass: 1,
        type: 'Dynamic',
        position: [0,1,0]
    }))

    // Store position of the player
    const pos = useRef([0,0,0]) // follow the sphere
    useEffect(() => {
        api.position.subscribe((p) => pos.current = p)
    }, [api.position])

    // Store velocity of the player
    const vel = useRef([0,0,0]) // follow the sphere
    useEffect(() => {
        api.velocity.subscribe((v) => vel.current = v)
    }, [api.velocity])

    // Glues the camera to the player
    useFrame( () => {
        camera.position.copy(
            new Vector3(
            pos.current[0],
            pos.current[1], 
            pos.current[2]))
        
        // Get actual direction
        const direction = new Vector3()

        const frontVector = new Vector3(
            0,
            0,
            (moveBackward ? 1 : 0) - (moveForward ? 1 : 0)
        )
        
        const sideVector = new Vector3(
            (moveLeft ? 1 : 0) - (moveRight ? 1 : 0),
            0,
            0
        )

        direction
            .subVectors(frontVector,sideVector)
            .normalize()
            .multiplyScalar(SPEED)
            .applyEuler(camera.rotation)

        api.velocity.set(direction.x, vel.current[1], direction.z)

        // Jumps
        if(jump && Math.abs(vel.current[1]) < 0.05){
            api.velocity.set(
                vel.current[0],
                JUMP_FORCE,
                vel.current[2])
        }
    })

    return (
        <mesh ref = {ref}></mesh>
    )
}