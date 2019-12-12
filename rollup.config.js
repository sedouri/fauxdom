import {terser} from "rollup-plugin-terser";
import buble from "rollup-plugin-buble";
import stripCode from "rollup-plugin-strip-code";
import {spawn} from "child_process";
import {zip} from "compressing";
import * as fs from "fs";
import * as path from "path";

import * as pkg from "./package.json";

let DEBUG = true;

spawn( process.execPath, ["./scripts/entities.js"] );

export default args =>
{	
	DEBUG = !!args.configDebug;
	
	const debugStripper = stripCode( {
			start_comment: "@START_DEBUG",
			end_comment: "@END_DEBUG"
		} ),
		unitTestStripper = stripCode( {
			start_comment: "@START_UNIT_TESTS",
			end_comment: "@END_UNIT_TESTS"
		} ),
		browserStripper = stripCode( {
			start_comment: "@START_BROWSER_ONLY",
			end_comment: "@END_BROWSER_ONLY"
		} ),
		modulePlugins = [debugStripper, browserStripper],
		iifePlugins = [debugStripper, unitTestStripper, buble()],
		output = [
			{
				onwarn,
				input: "src/document.js",
				plugins: modulePlugins,
				output: [
					module( "esm" ),
					module( "cjs" )
				]
			},
			{
				onwarn,
				input: "src/document.js",
				plugins: iifePlugins,
				output: module( "iife" )
			}
		];
	
	if ( !DEBUG )
	{
		modulePlugins.push( unitTestStripper, terser( {module: true} ), zipFile() );
		iifePlugins.push( terser( {safari10: true} ), zipFile() );
	}
	else
	{
		output.push( {
			onwarn,
			input: "src/document.js",
			plugins: [browserStripper],
			output: module( "cjs", "tests." )
		} );
		iifePlugins.push( terser( {compress: false, mangle: false, output: {beautify: true}, safari10: true} ) );
	}
	
	return output;
}

function onwarn( warning )
{
	if ( warning.code !== "CIRCULAR_DEPENDENCY" ||
			!(warning.message.endsWith( "src/node.js -> src/document.js" ) || warning.message.endsWith( "src\\node.js -> src\\document.js" ) ||
				warning.message.endsWith( "src/node.js -> src/html-parser.js" ) || warning.message.endsWith( "src\\node.js -> src\\html-parser.js" ) ||
				warning.message.endsWith( "src/selectors.js -> src/node.js" ) || warning.message.endsWith( "src\\selectors.js -> src\\node.js" )) )
		console.warn( warning );
}

const fileExts = {
	"esm": "mjs",
	"cjs": "cjs"
};

function module( format, ext = "" )
{
	const output = {
		file: `lib/${pkg.name}.${ext}`,
		format,
		interop: false,
		esModule: false,
		freeze: false,
		exports: "default",
		sourcemap: (DEBUG && format === "cjs")
	};
	output.file += fileExts[format] || "js";
	if ( format === "iife" )
		output.name = "DOM";
	return output
}

function zipFile()
{
	return {
		name: "Zip",
		
		renderChunk( src, chunk, options )
		{
			const ext = path.extname( options.file ),
				fileName = path.basename( options.file, ext ),
				dirName = path.dirname( options.file );
			
			if ( ext === ".js" || ext === ".mjs" )
				zip.compressFile(
					Buffer.from( src ),
					path.join( dirName, fileName + (ext === ".mjs" ? ".module" : "") +".zip" ),
					{relativePath: fileName +".js"}
				);
			
			return null;
		}
	};
}